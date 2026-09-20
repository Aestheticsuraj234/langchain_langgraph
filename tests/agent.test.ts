import { expect, test } from "bun:test";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tool } from "langchain";
import { z } from "zod";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { createWorkspace } from "../src/shared/files";
import { buildCodingGraph } from "../src/shared/graph";

test("file tools create, read, edit and reject escapes, links and ambiguous edits", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-workshop-"));
  try {
    const files = createWorkspace(root);
    await files.write("src/demo.ts", "const color = 'red';");
    expect(await files.list(".")).toBe("src/");
    await files.edit("src/demo.ts", "'red'", "'purple'");
    expect(await files.read("src/demo.ts")).toBe("const color = 'purple';");
    await expect(files.write("../outside.txt", "no")).rejects.toThrow("inside playground");
    await expect(files.write(".env", "no")).rejects.toThrow("Hidden");
    await symlink(tmpdir(), join(root, "linked"));
    await expect(files.read("linked/file.txt")).rejects.toThrow("Symlinks");
    await expect(files.edit("src/demo.ts", "missing", "x")).rejects.toThrow("exactly once");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("graph executes requested tool, returns result to model, and isolates threads", async () => {
  const echo = tool(({ text }) => `OBSERVATION:${text}`, {
    name: "echo", description: "Echo text", schema: z.object({ text: z.string() }),
  });
  const graph = buildCodingGraph({
    async invoke(messages) {
      const last = messages.at(-1);
      if (ToolMessage.isInstance(last)) return new AIMessage(`Received ${last.content}`);
      if (last?.content === "use tool") return new AIMessage({
        content: "", tool_calls: [{ id: "call_1", name: "echo", args: { text: "hello" }, type: "tool_call" }],
      });
      return new AIMessage(`Human turns: ${messages.filter((m) => HumanMessage.isInstance(m)).length}`);
    },
  }, [echo]);
  const config = { configurable: { thread_id: "one" }, recursionLimit: 10 };
  const first = await graph.invoke({ messages: [new HumanMessage("use tool")] }, config);
  expect(first.messages.at(-1)?.content).toBe("Received OBSERVATION:hello");
  expect(first.messages.some((m) => ToolMessage.isInstance(m) && m.tool_call_id === "call_1")).toBe(true);
  const second = await graph.invoke({ messages: [new HumanMessage("follow up")] }, config);
  expect(second.messages.at(-1)?.content).toBe("Human turns: 2");
  const other = await graph.invoke({ messages: [new HumanMessage("hello")] }, { configurable: { thread_id: "two" } });
  expect(other.messages.at(-1)?.content).toBe("Human turns: 1");
});

test("graph turns tool failure into an observation and stops unbounded loops", async () => {
  const broken = tool(() => { throw new Error("Example failure"); }, {
    name: "broken", description: "Fails for testing", schema: z.object({}),
  });
  const graph = buildCodingGraph({ async invoke(messages) {
    const last = messages.at(-1);
    if (ToolMessage.isInstance(last)) return new AIMessage(String(last.content));
    return new AIMessage({ content: "", tool_calls: [{ name: "broken", args: {}, id: "bad_1", type: "tool_call" }] });
  } }, [broken]);
  const result = await graph.invoke({ messages: [new HumanMessage("try")] }, { configurable: { thread_id: "error" } });
  expect(result.messages.at(-1)?.content).toContain("Example failure");
  const looping = buildCodingGraph({ async invoke() {
    return new AIMessage({ content: "", tool_calls: [{ name: "broken", args: {}, id: crypto.randomUUID(), type: "tool_call" }] });
  } }, [broken]);
  await expect(looping.invoke({ messages: [new HumanMessage("loop")] }, {
    configurable: { thread_id: "loop" }, recursionLimit: 4,
  })).rejects.toThrow();
});

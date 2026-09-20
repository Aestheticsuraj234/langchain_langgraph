import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tool } from "langchain";
import { z } from "zod";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { createWorkspace } from "../src/shared/files";
import { buildCodingGraph } from "../src/shared/graph";

test("file tools can create, read, and edit a file", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-workshop-"));
  try {
    const files = createWorkspace(root);
    await files.write("src/demo.ts", "const color = 'red';");
    expect(await files.list(".")).toBe("src/");
    await files.edit("src/demo.ts", "'red'", "'purple'");
    expect(await files.read("src/demo.ts")).toBe("const color = 'purple';");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("graph runs a tool and remembers the thread", async () => {
  const echo = tool(({ text }) => `OBSERVATION:${text}`, {
    name: "echo",
    description: "Echo text",
    schema: z.object({ text: z.string() }),
  });
  const graph = buildCodingGraph({
    async invoke(messages: any[]) {
      const last = messages.at(-1);
      if (ToolMessage.isInstance(last)) return new AIMessage(`Received ${last.content}`);
      if (last?.content === "use tool") {
        return new AIMessage({
          content: "",
          tool_calls: [{ id: "call_1", name: "echo", args: { text: "hello" }, type: "tool_call" }],
        });
      }
      return new AIMessage(`Human turns: ${messages.filter((m) => HumanMessage.isInstance(m)).length}`);
    },
  }, [echo]);

  const config = { configurable: { thread_id: "one" } };
  const first = await graph.invoke({ messages: [new HumanMessage("use tool")] }, config);
  expect(first.messages.at(-1)?.content).toBe("Received OBSERVATION:hello");

  const second = await graph.invoke({ messages: [new HumanMessage("follow up")] }, config);
  expect(second.messages.at(-1)?.content).toBe("Human turns: 2");

  const other = await graph.invoke(
    { messages: [new HumanMessage("hello")] },
    { configurable: { thread_id: "two" } },
  );
  expect(other.messages.at(-1)?.content).toBe("Human turns: 1");
});

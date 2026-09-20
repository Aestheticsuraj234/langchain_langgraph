import { HumanMessage } from "@langchain/core/messages";
import { model } from "./shared/model";
import { codingTools } from "./shared/tools";
import { buildCodingGraph } from "./shared/graph";
import { runCli } from "./shared/cli";

const graph = buildCodingGraph(model.bindTools(codingTools), codingTools);
let threadId = crypto.randomUUID();

await runCli("Stage 5: LangGraph coding assistant", async (input) => {
  const result = await graph.invoke(
    { messages: [new HumanMessage(input)] },
    { configurable: { thread_id: threadId } },
  );
  return String(result.messages.at(-1)?.content);
}, () => { threadId = crypto.randomUUID(); });

import { createAgent } from "langchain";
import { HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { model } from "./shared/model";
import { basicTools } from "./shared/tools";
import { CODING_INSTRUCTIONS } from "./shared/instructions";
import { runCli } from "./shared/cli";

const agent = createAgent({
  model,
  tools: basicTools,
  systemPrompt: CODING_INSTRUCTIONS,
});
let messages: BaseMessage[] = [];

await runCli("Stage 4: LangChain coding assistant", async (input) => {
  const result = await agent.invoke(
    { messages: [...messages, new HumanMessage(input)] },
    { recursionLimit: 20 },
  );
  messages = result.messages;
  const content = messages.at(-1)?.content;
  return typeof content === "string" ? content : JSON.stringify(content);
}, () => { messages = []; });

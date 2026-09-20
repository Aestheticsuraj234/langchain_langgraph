import { HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { model } from "./shared/model";
import { runCli } from "./shared/cli";

const system = new SystemMessage("You are a helpful coding tutor. Keep answers concise.");
let messages: BaseMessage[] = [system];

await runCli("Stage 3: CLI chat (no file tools yet)", async (input) => {
  const nextMessages = [...messages, new HumanMessage(input)];
  const response = await model.invoke(nextMessages);
  messages = [...nextMessages, response];
  return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
}, () => { messages = [system]; });

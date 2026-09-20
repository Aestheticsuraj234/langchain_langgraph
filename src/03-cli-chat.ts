import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "./shared/model";
import { runCli } from "./shared/cli";

const system = new SystemMessage("You are a helpful coding tutor. Keep answers concise.");
let messages: any[] = [system];

await runCli("Stage 3: CLI chat (no file tools yet)", async (input) => {
  messages = [...messages, new HumanMessage(input)];
  const response = await model.invoke(messages);
  messages = [...messages, response];
  return String(response.content);
}, () => { messages = [system]; });

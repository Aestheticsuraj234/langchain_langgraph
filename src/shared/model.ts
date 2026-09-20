import { ChatOpenAI } from "@langchain/openai";
import { MODEL, requireApiKey } from "./config";

export const model = new ChatOpenAI({
  apiKey: requireApiKey(),
  model: MODEL,
  timeout: 60_000,
  maxRetries: 1,
});

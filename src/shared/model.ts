import { ChatOpenAI } from "@langchain/openai";
import { MODEL, OPENAI_API_KEY } from "./config";

export const model = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: MODEL,
});

import OpenAI from "openai";
import { MODEL, requireApiKey } from "./shared/config";

const client = new OpenAI({ apiKey: requireApiKey() });
const response = await client.responses.create({
  model: MODEL,
  instructions: "You are a friendly programming tutor. Be concise.",
  input: "Explain an AI agent using a college-library example.",
  store: false,
});
console.log(response.output_text);

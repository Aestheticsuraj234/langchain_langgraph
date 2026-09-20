import OpenAI from "openai";
import { MODEL, OPENAI_API_KEY } from "./shared/config";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });
const response = await client.responses.create({
  model: MODEL,
  instructions: "You are a friendly programming tutor. Be concise.",
  input: "Explain an AI agent using a college-library example.",
});
console.log(response.output_text);

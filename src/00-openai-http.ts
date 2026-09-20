import { MODEL, requireApiKey } from "./shared/config";

// A normal HTTP POST: the framework is not required to call an LLM.
const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${requireApiKey()}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: MODEL,
    instructions: "You are a friendly programming tutor. Be concise.",
    input: "Explain an AI agent using a college-library example.",
    store: false,
  }),
});

if (!response.ok) {
  throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
}

// Raw HTTP returns output items. output_text is a convenience on the SDK result.
const data = await response.json();
for (const item of data.output ?? []) {
  if (item.type !== "message") continue;
  for (const block of item.content ?? []) {
    if (block.type === "output_text") console.log(block.text);
  }
}

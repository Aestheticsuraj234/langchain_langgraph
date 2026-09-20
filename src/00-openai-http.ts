import { MODEL, OPENAI_API_KEY } from "./shared/config";

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: MODEL,
    instructions: "You are a friendly programming tutor. Be concise.",
    input: "Explain an AI agent using a college-library example.",
  }),
});

const data = await response.json();
for (const item of data.output) {
  if (item.type !== "message") continue;
  for (const block of item.content) {
    if (block.type === "output_text") console.log(block.text);
  }
}

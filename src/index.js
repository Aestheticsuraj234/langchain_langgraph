import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { TavilyExtract, TavilySearch } from "@langchain/tavily";

if (!process.env.OPENAI_API_KEY || !process.env.TAVILY_API_KEY) {
  console.error("Missing OPENAI_API_KEY or TAVILY_API_KEY in .env");
  process.exit(1);
}

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  tools: [
    new TavilySearch({ maxResults: 5 }),
    new TavilyExtract({ format: "markdown", extractDepth: "advanced" }),
  ],
  systemPrompt:
    "You are a helpful assistant. Use tavily_extract for URLs, tavily_search for web search. Keep answers short.",
});

const rl = readline.createInterface({ input, output });
console.log('Chat Agent (streaming). Type "exit" to quit.\n');

while (true) {
  const question = await rl.question("You: ");
  if (question.trim().toLowerCase() === "exit") break;

  process.stdout.write("Agent: ");
  for await (const [chunk] of await agent.stream(
    { messages: [{ role: "user", content: question }] },
    { streamMode: "messages" },
  )) {
    if (typeof chunk.content === "string") process.stdout.write(chunk.content);
  }
  console.log("\n");
}

rl.close();

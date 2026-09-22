import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { tavily } from "@tavily/core";
import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";

if (!process.env.OPENAI_API_KEY || !process.env.TAVILY_API_KEY) {
  console.error("Missing OPENAI_API_KEY or TAVILY_API_KEY in .env");
  process.exit(1);
}

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const webSearch = tool(
  async ({ query }) => {
    const data = await tvly.search(query, { maxResults: 5 });
    return JSON.stringify(data.results ?? []);
  },
  {
    name: "web_search",
    description: "Search the web for information.",
    schema: z.object({ query: z.string().describe("Search query") }),
  },
);

const visitPage = tool(
  async ({ url }) => {
    const data = await tvly.extract([url], {
      extractDepth: "advanced",
      format: "markdown",
    });
    return data.results?.[0]?.rawContent ?? JSON.stringify(data);
  },
  {
    name: "visit_page",
    description: "Read and extract content from a URL.",
    schema: z.object({ url: z.string().describe("URL to read") }),
  },
);

const Answer = z.object({
  answer: z.string().describe("Answer for the user"),
  confidence: z.enum(["low", "medium", "high"]),
});

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  tools: [webSearch, visitPage],
  systemPrompt:
    "Use visit_page for URLs, web_search for general search. Be accurate.",
  responseFormat: Answer,
});

const rl = readline.createInterface({ input, output });
console.log('Agent (web search + structured output). Type "exit" to quit.\n');

while (true) {
  const question = await rl.question("You: ");
  if (question.trim().toLowerCase() === "exit") break;

  const result = await agent.invoke({
    messages: [{ role: "user", content: question }],
  });

  console.log(JSON.stringify(result.structuredResponse, null, 2), "\n");
}

rl.close();

import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { TavilyExtract, TavilySearch } from "@langchain/tavily";

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  console.error("Get a key at https://platform.openai.com/api-keys");
  process.exit(1);
}

if (!process.env.TAVILY_API_KEY) {
  console.error("Missing TAVILY_API_KEY in .env");
  console.error("Get a free key at https://tavily.com");
  process.exit(1);
}

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
});

const webSearch = new TavilySearch();

const visitPage = new TavilyExtract({
  format: "markdown",
  extractDepth: "advanced",
});

const agent = createAgent({
  model,
  tools: [webSearch, visitPage],
  systemPrompt: `You are a helpful assistant with two tools:

1. tavily_search — search the web for information
2. tavily_extract — read and extract content from a specific URL

Rules:
- If the user gives a URL, ALWAYS use tavily_extract with that URL
- If the user asks to search or find info, use tavily_search
- For site-specific search, use includeDomains with just the domain (e.g. "chaicode.com", NOT a full path)
- After using a tool, list all items found (e.g. every course title) — do not give vague summaries`,
});

const rl = readline.createInterface({ input, output });

console.log("Chat Agent (OpenAI + Tavily)");
console.log('Try: "https://chaicode.com/udemy list all courses"');
console.log('Type "exit" to quit.\n');

while (true) {
  const question = await rl.question("You: ");

  if (question.trim().toLowerCase() === "exit") {
    console.log("Bye!");
    break;
  }

  const result = await agent.invoke({
    messages: [{ role: "user", content: question }],
  });

  for (const message of result.messages) {
    if (message.tool_calls?.length) {
      for (const call of message.tool_calls) {
        console.log(`🔧 Tool called: ${call.name}(${JSON.stringify(call.args)})`);
      }
    }
  }

  console.log("Agent:", result.messages.at(-1).content, "\n");
}

rl.close();

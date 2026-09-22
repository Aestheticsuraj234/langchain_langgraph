## Tool Calling (Web Search)

> Based on [LangChain Quickstart](https://docs.langchain.com/oss/javascript/langchain/quickstart) and [Tools docs](https://docs.langchain.com/oss/javascript/langchain/tools)

---

### What is tool calling?

**Tools** are functions the model can call to **take action** — search the web, read a URL, query a database, send email, etc.

From the agent loop:

```
User asks → Model decides → calls tool → reads result → final answer
```

Without tools, the model only knows what it was trained on.  
With tools, it can fetch **live data**.

---

### Define a tool with `tool()`

```typescript
import { tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  async ({ city }) => {
    // Your logic here — call an API, DB, etc.
    return `It's sunny in ${city}!`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);
```

| Field | Purpose |
|-------|---------|
| `name` | Identifier the model uses to call the tool |
| `description` | Tells the model **when** to use it |
| `schema` | Zod schema for arguments (validated automatically) |

Good descriptions matter — the model picks tools based on them.

---

### Web search with Tavily

Install:

```bash
bun add @tavily/core
```

Define search + page-visit tools:

```typescript
import { tavily } from "@tavily/core";
import { tool } from "langchain";
import * as z from "zod";

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
```

---

### Attach tools to the agent

```typescript
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  tools: [webSearch, visitPage],
  systemPrompt:
    "Use visit_page for URLs, web_search for general search. Be accurate.",
});
```

The harness handles:

1. Sending tool definitions to the model
2. Parsing tool calls from the response
3. Running your functions
4. Feeding results back to the model
5. Looping until the task is done

---

### Example run

```
You: What's on https://example.com?

1. Model calls visit_page({ url: "https://example.com" })
2. Tool returns page content
3. Model summarizes and replies
```

Log tool calls while learning:

```typescript
for (const message of result.messages) {
  if (message.tool_calls?.length) {
    for (const call of message.tool_calls) {
      console.log(`Tool: ${call.name}(${JSON.stringify(call.args)})`);
    }
  }
}
```

---

### Environment variables

```bash
OPENAI_API_KEY=your-openai-key
TAVILY_API_KEY=your-tavily-key
```

Get a Tavily key at [tavily.com](https://tavily.com).

---

### Tool design tips

1. **One job per tool** — `web_search` vs `visit_page`, not one mega-tool
2. **Clear descriptions** — "Search the web for current information"
3. **Zod `.describe()`** on each field — helps the model fill args correctly
4. **Return strings** — JSON.stringify complex data so the model can read it
5. **System prompt** — tell the agent which tool to prefer for which task

---

### Summary

- `tool()` wraps a function the model can call
- `createAgent({ tools: [...] })` registers them in the harness
- The agent loop runs tools automatically until the task completes
- Web search = external API (Tavily) behind a tool the model invokes

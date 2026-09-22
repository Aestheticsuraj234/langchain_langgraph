## Structured Output

> Based on [LangChain Structured Output docs](https://docs.langchain.com/oss/javascript/langchain/structured-output)

---

### What is structured output?

Instead of parsing free-form text, the agent returns **typed, validated data** — JSON matching a schema you define.

Use cases:

- Extract contact info into `{ name, email, phone }`
- Return `{ answer, confidence }` for a Q&A bot
- Parse product reviews into `{ rating, sentiment, keyPoints }`

From the docs:

> Structured output allows agents to return data in a specific, predictable format.

---

### Define a schema with Zod

```typescript
import * as z from "zod";

const Answer = z.object({
  answer: z.string().describe("Answer for the user"),
  confidence: z.enum(["low", "medium", "high"]),
});
```

---

### Attach to `createAgent`

```typescript
import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  tools: [webSearch, visitPage],
  systemPrompt: "Be accurate. Use tools when needed.",
  responseFormat: Answer,
});
```

The validated result is in **`structuredResponse`**:

```typescript
const result = await agent.invoke({
  messages: [{ role: "user", content: "What is LangChain?" }],
});

console.log(result.structuredResponse);
// { answer: "LangChain is...", confidence: "high" }
```

---

### How it works under the hood

LangChain picks a strategy automatically:

| Strategy | When |
|----------|------|
| **Provider strategy** | Model supports native structured output (OpenAI, Anthropic, Gemini…) |
| **Tool strategy** | Model uses a tool call to return structured data |

You can force a strategy:

```typescript
import { providerStrategy, toolStrategy } from "langchain";

responseFormat: providerStrategy(Answer)  // native API
responseFormat: toolStrategy(Answer)      // tool-based fallback
```

---

### Full example (matches `src/index.js`)

```typescript
import "dotenv/config";
import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";

const Answer = z.object({
  answer: z.string().describe("Answer for the user"),
  confidence: z.enum(["low", "medium", "high"]),
});

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  tools: [webSearch, visitPage],
  systemPrompt: "Use tools when needed. Be accurate.",
  responseFormat: Answer,
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "What is LangChain?" }],
});

console.log(JSON.stringify(result.structuredResponse, null, 2));
```

Output:

```json
{
  "answer": "LangChain is an agent framework...",
  "confidence": "high"
}
```

---

### Structured output + tools

Tools and structured output work together:

1. Agent may call tools to gather data
2. Final response is validated against your Zod schema
3. You read `structuredResponse` — no manual JSON parsing

If the model returns invalid data, LangChain can retry with error feedback (tool strategy).

---

### Schema tips

1. Use `.describe()` on fields — helps the model fill them correctly
2. Use `z.enum()` for fixed choices (`"low" | "medium" | "high"`)
3. Keep schemas focused — one purpose per schema
4. Prefer structured output when downstream code needs reliable fields

---

### Summary

- `responseFormat: z.object({...})` on `createAgent`
- Read result from `result.structuredResponse`
- Works alongside tools — agent gathers data, returns typed output
- LangChain validates and retries on schema errors automatically

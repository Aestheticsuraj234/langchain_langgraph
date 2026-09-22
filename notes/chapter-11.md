## Streaming Output

> Based on [LangChain Streaming docs](https://docs.langchain.com/oss/javascript/langchain/streaming)

---

### Why stream?

LLMs can take seconds to respond. **Streaming** shows output as it's generated — better UX than waiting for the full reply.

From the docs:

> Streaming is crucial for enhancing the responsiveness of applications built on LLMs.

---

### What you can stream

| Mode | What you get |
|------|--------------|
| `updates` | State updates after each agent step |
| `messages` | LLM tokens as they're generated |
| `custom` | User-defined signals from inside nodes |

Common use cases:

- Print tokens word-by-word in a CLI
- Show "Searching..." while a tool runs
- Display progress through multi-step agents

---

### Stream agent progress (`streamMode: "updates"`)

After each step you get a chunk — e.g. tool call, tool result, final answer:

```typescript
const stream = await agent.stream(
  { messages: [{ role: "user", content: "What's the weather in Mumbai?" }] },
  { streamMode: "updates" },
);

for await (const chunk of stream) {
  console.log(chunk);
}
```

Typical flow with one tool call:

1. LLM node → `AIMessage` with tool call request
2. Tool node → `ToolMessage` with result
3. LLM node → final AI response

---

### Stream LLM tokens (`streamMode: "messages"`)

Print text as the model generates it:

```typescript
const stream = await agent.stream(
  { messages: [{ role: "user", content: "Explain AI in 2 sentences." }] },
  { streamMode: "messages" },
);

for await (const [token, metadata] of stream) {
  process.stdout.write(token.content ?? "");
}
```

---

### Event streaming (recommended for new apps)

LangChain v1.3+ adds typed projections via `streamEvents`:

```typescript
const stream = await agent.streamEvents(
  { messages: [{ role: "user", content: "what is the weather in sf" }] },
  { version: "v3" },
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool: ${call.name}(${JSON.stringify(call.input)})`);
    }
  })(),
]);
```

Separate iterators for messages, tool calls, and final output — no manual `streamMode` branching.

---

### CLI example with streaming

```typescript
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", streaming: true }),
  systemPrompt: "Be concise.",
});

const question = await rl.question("You: ");

process.stdout.write("Agent: ");
const stream = await agent.stream(
  { messages: [{ role: "user", content: question }] },
  { streamMode: "messages" },
);

for await (const [token] of stream) {
  process.stdout.write(token.content ?? "");
}
console.log("\n");
```

Set `streaming: true` on the model so tokens emit incrementally.

---

### Memory + streaming

Pass a `thread_id` with a checkpointer to stream multi-turn conversations:

```typescript
import { MemorySaver } from "@langchain/langgraph";

const agent = createAgent({
  model: "openai:gpt-4o-mini",
  tools: [getWeather],
  checkpointer: new MemorySaver(),
});

const config = { configurable: { thread_id: "user-123" } };

const stream = await agent.stream(
  { messages: [{ role: "user", content: "Hi" }] },
  { ...config, streamMode: "updates" },
);
```

---

### Summary

- Use `.stream()` or `.streamEvents()` instead of `.invoke()` for live output
- `updates` = step-by-step agent progress
- `messages` = token-by-token text
- Enable `streaming: true` on the model for token streaming
- Streaming works with tools — you'll see tool steps before the final answer

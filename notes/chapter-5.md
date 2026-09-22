## Build a CLI Chat Agent (System Prompt)

> Based on [LangChain Quickstart](https://docs.langchain.com/oss/javascript/langchain/quickstart)

---

### Goal

Build a **command-line chat agent** — type a question, get an answer.  
No tools yet. Just model + system prompt + a simple input loop.

---

### What is a system prompt?

The **system prompt** tells the model how to behave — its role, tone, and rules.

From the harness perspective:

> System prompt = instructions the model always sees before your messages.

Examples:

- `"You are a helpful coding assistant. Be concise."`
- `"You are a travel agent. Always suggest budget options."`
- `"Respond in Hindi. Never share personal data."`

Pass it to `createAgent`:

```typescript
const agent = createAgent({
  model: "openai:gpt-4o-mini",
  systemPrompt: "You are a friendly tutor. Explain concepts simply.",
});
```

---

### Minimal CLI agent

```typescript
import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const agent = createAgent({
  model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
  systemPrompt:
    "You are a helpful assistant. Answer clearly and keep replies short.",
});

const rl = readline.createInterface({ input, output });
console.log('Chat agent. Type "exit" to quit.\n');

while (true) {
  const question = await rl.question("You: ");
  if (question.trim().toLowerCase() === "exit") break;

  const result = await agent.invoke({
    messages: [{ role: "user", content: question }],
  });

  console.log("Agent:", result.messages.at(-1)?.content, "\n");
}

rl.close();
```

---

### What happens on each turn

```
1. User types a question in the terminal
2. Question becomes a user message
3. LangChain sends system prompt + user message to the model
4. Model returns an assistant message
5. You print the reply and loop
```

```
You: What is an LLM?
  ↓
Agent: A large language model is an AI trained on text...
```

---

### Key pieces

| Piece | Role |
|-------|------|
| `createAgent()` | Creates the agent harness |
| `model` | Which LLM to call |
| `systemPrompt` | Behavior / personality |
| `messages` | Input for each turn |
| `agent.invoke()` | Run one conversation turn |
| `result.messages.at(-1)` | Last message = model reply |

---

### Run it

```bash
bun add langchain @langchain/core @langchain/openai dotenv
export OPENAI_API_KEY="your-key"
bun run src/cli-agent.js
```

---

### Tips for good system prompts

1. **Be specific** — "You are a Python tutor" beats "You are helpful"
2. **Set constraints** — length, language, format
3. **Define role** — tutor, reviewer, planner, etc.
4. **Add rules** — what to avoid, when to ask clarifying questions

---

### Summary

- A CLI agent = readline loop + `createAgent` + `invoke`
- **System prompt** shapes every reply
- **Model + harness** — even without tools, `createAgent` runs the agent loop for you
- Each turn sends `{ role: "user", content: "..." }` and reads the last assistant message

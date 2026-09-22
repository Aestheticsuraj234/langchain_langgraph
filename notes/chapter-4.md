## Introduction to LangChain

> Based on [LangChain overview](https://docs.langchain.com/oss/javascript/langchain/overview) and [Quickstart](https://docs.langchain.com/oss/javascript/langchain/quickstart)

---

### What is LangChain?

**LangChain** is an open-source **agent framework** for building apps with LLMs.

From the docs:

> *"LangChain provides `createAgent`: a minimal, highly configurable agent harness."*

**Simple analogy:**  
If an LLM is the engine, LangChain is the **car** — wheels (tools), steering (prompt), dashboard (memory), and the driver loop (agent loop) already wired up.

**One line:**  
> LangChain helps you build **agents** without writing the harness from scratch.

---

### The problem LangChain solves

Without LangChain, building an agent means hand-writing:

```
❌ Call OpenAI API manually
❌ Parse tool calls yourself
❌ Run tools and feed results back
❌ Manage conversation history
❌ Handle retries, streaming, errors
❌ Repeat all of this for Anthropic, Google, etc.
```

With LangChain:

```
✅ One API for any model provider
✅ Built-in agent loop (model → tool → model)
✅ Standard tools, messages, memory
✅ Add features via middleware
✅ Switch GPT ↔ Claude ↔ Gemini with one line
```

---

### LangChain in the stack

```
┌─────────────────────────────────────────────┐
│              YOUR APP                        │
│                                             │
│   LangChain (framework / harness builder)   │
│   ┌─────────────────────────────────────┐   │
│   │  createAgent()                       │   │
│   │  • model                             │   │
│   │  • tools                             │   │
│   │  • systemPrompt                      │   │
│   │  • middleware                        │   │
│   │  • memory                            │   │
│   └─────────────────────────────────────┘   │
│              ↓ built on top of              │
│   LangGraph (runtime / orchestration)       │
│              ↓                              │
│   LLM providers (OpenAI, Anthropic, etc.)   │
└─────────────────────────────────────────────┘
```

LangChain is built on LangGraph, but you don't need to write graph code to start.

---

### LangChain vs LangGraph vs Deep Agents vs LangSmith

| Tool | Type | What it is | When to use |
|------|------|------------|-------------|
| **LangChain** | Framework | Easy agent building with `createAgent` | Getting started, standard agents |
| **LangGraph** | Runtime | Low-level workflow orchestration | Complex workflows, integrations |
| **Deep Agents** | Batteries-included harness | Planning, filesystem, subagents built in | Long, complex autonomous tasks |
| **LangSmith** | Observability | Trace, debug, evaluate agents | Production debugging & monitoring |

From the docs:

> *"Use LangChain (`createAgent`) for a highly customizable harness."*  
> *"Use LangGraph for advanced needs combining deterministic and agentic workflows."*

---

### Core benefits

#### 1. Standard model interface

One API works across providers:

```typescript
model: "openai:gpt-4"
model: "anthropic:claude-sonnet-4-6"
model: "google-genai:gemini-2.5-flash-lite"
```

#### 2. Highly configurable harness

Start minimal, add only what you need:

```typescript
createAgent({ model, tools })
createAgent({ model, tools, systemPrompt })
createAgent({ model, tools, middleware: [...] })
createAgent({ model, tools, checkpointer })
```

#### 3. Built on LangGraph

Durable execution, persistence, and human-in-the-loop support under the hood.

#### 4. Debug with LangSmith

Trace every model call, tool call, and latency in one place (optional).

---

### Main LangChain building blocks

| Building block | What it does |
|----------------|--------------|
| `createAgent()` | Creates an agent with harness |
| `model` | Which LLM to use |
| `systemPrompt` | Agent behavior / personality |
| `tool()` | Define actions |
| `messages` | Conversation history |
| `.stream()` | Real-time output |
| `responseFormat` | Structured JSON output |
| `middleware` | Extra harness logic |
| `checkpointer` | Persist memory across turns |

---

### Installation (TypeScript / Bun)

```bash
bun add langchain @langchain/core zod
bun add @langchain/openai      # OpenAI (GPT)
bun add @langchain/anthropic   # Anthropic (Claude)
bun add @langchain/google-genai # Google (Gemini)
```

Set your API key:

```bash
export OPENAI_API_KEY="your-api-key"
```

Or in a `.env` file:

```
OPENAI_API_KEY=your-api-key
```

---

### Your first LangChain agent (preview)

```typescript
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  (input) => `It's always sunny in ${input.city}!`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

const agent = createAgent({
  model: "openai:gpt-4",
  tools: [getWeather],
  systemPrompt: "You are a helpful assistant.",
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "What's the weather in Mumbai?" }],
});

console.log(result.messages.at(-1)?.content);
```

What LangChain handles automatically:

- Sends the message to the model
- Model decides to call `get_weather`
- Runs the tool with `"Mumbai"`
- Sends the result back to the model
- Model returns the final answer

---

### LangChain ecosystem map

```
LangChain Ecosystem
├── langchain          → main package (createAgent, tools)
├── @langchain/core    → core abstractions (messages, tools)
├── @langchain/openai  → OpenAI integration
├── @langchain/anthropic → Anthropic integration
├── @langchain/langgraph → runtime (used under the hood)
├── deepagents         → batteries-included agent (advanced)
└── langsmith          → tracing & evaluation (optional)
```

---

### When to use LangChain

Use LangChain when you want to:

- Quickly build agents and autonomous apps
- Use standard abstractions for models, tools, and agent loops
- Start simple but keep flexibility for advanced features
- Build straightforward agents without complex orchestration

Use **LangGraph** when you need:

- Multi-step workflows (Notion → Calendar → Email)
- Conditional branching
- Long-running stateful agents

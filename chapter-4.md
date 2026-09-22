Here is **Step 4: Introduction to LangChain** — building on Steps 1–3 and aligned with the [LangChain overview](https://docs.langchain.com/oss/javascript/langchain/overview) and [Quickstart](https://docs.langchain.com/oss/javascript/langchain/quickstart).

---

## Step 4: Introduction to LangChain

### Quick recap

```
Step 1 ✅  LLM = brain
Step 2 ✅  Agent = Model + Harness
Step 3 ✅  Harness = prompt, tools, loop, memory, middleware
Step 4 →   LangChain = the framework that gives you all of this
```

---

### What is LangChain?

**LangChain** is an open-source **agent framework** for building apps with LLMs.

From the docs:

> *"LangChain provides* `createAgent`*: a minimal, highly configurable agent harness."*

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



### LangChain in your mental model

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

Important: **LangChain is built on LangGraph**, but you don't need to know LangGraph to start with LangChain.

---



### LangChain vs LangGraph vs Deep Agents vs LangSmith


| Tool            | Type                       | What it is                               | When to use                                     |
| --------------- | -------------------------- | ---------------------------------------- | ----------------------------------------------- |
| **LangChain**   | Framework                  | Easy agent building with `createAgent`   | Getting started, standard agents                |
| **LangGraph**   | Runtime                    | Low-level workflow orchestration         | Complex workflows, Notion/Calendar integrations |
| **Deep Agents** | Batteries-included harness | Planning, filesystem, subagents built in | Long, complex autonomous tasks                  |
| **LangSmith**   | Observability              | Trace, debug, evaluate agents            | Production debugging & monitoring               |


From the docs:

> *"Use LangChain (*`createAgent`*) for a highly customizable harness."*  
> *"Use LangGraph for advanced needs combining deterministic and agentic workflows."*

**Your course path:**

```
LangChain first  →  build CLI agent, tools, streaming
LangGraph later  →  StateGraph, nodes, edges, workflows
```

---



### Core benefits of LangChain



#### 1. Standard model interface

One API works across providers:

```typescript
// Same code pattern, different models
model: "openai:gpt-4"
model: "anthropic:claude-sonnet-4-6"
model: "google-genai:gemini-2.5-flash-lite"
```



#### 2. Highly configurable harness

Start minimal, add only what you need:

```typescript
createAgent({ model, tools })                          // minimal
createAgent({ model, tools, systemPrompt })            // + instructions
createAgent({ model, tools, middleware: [...] })       // + retries, guardrails
createAgent({ model, tools, checkpointer })            // + memory
```



#### 3. Built on LangGraph

You get durable execution, persistence, and human-in-the-loop support under the hood — without writing graph code yet.

#### 4. Debug with LangSmith

Trace every model call, tool call, and latency in one place (optional, for production).

---



### Main LangChain building blocks

These map directly to your upcoming chapters:


| Building block   | What it does                  | Your next chapter          |
| ---------------- | ----------------------------- | -------------------------- |
| `createAgent()`  | Creates an agent with harness | Step 5 — CLI chat agent    |
| `model`          | Which LLM to use              | Step 5                     |
| `systemPrompt`   | Agent behavior / personality  | Step 5                     |
| `tool()`         | Define actions                | Step 6 — web search        |
| `messages`       | Conversation history          | Step 7 — message objects   |
| `.stream()`      | Real-time output              | Step 8 — streaming         |
| `responseFormat` | Structured JSON output        | Step 9 — structured output |
| `middleware`     | Extra harness logic           | Advanced                   |
| `checkpointer`   | Persist memory                | Memory chapter             |


---



### Installation (TypeScript / Bun)

Your project uses **Bun**. Install the core packages:

```bash
bun add langchain @langchain/core zod
```

Add a provider package for your chosen model:

```bash
bun add @langchain/openai      # OpenAI (GPT)
bun add @langchain/anthropic   # Anthropic (Claude)
bun add @langchain/google-genai # Google (Gemini)
```

Set your API key (example for OpenAI):

```bash
export OPENAI_API_KEY="your-api-key"
```

Or in a `.env` file:

```
OPENAI_API_KEY=your-api-key
```

---



### Your first LangChain agent (preview)

This is what you'll build in Step 5:

```typescript
import { createAgent, tool } from "langchain";
import * as z from "zod";

// 1. Define a tool (action the agent can take)
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

// 2. Create the agent (Model + Harness)
const agent = createAgent({
  model: "openai:gpt-4",        // brain
  tools: [getWeather],          // actions
  systemPrompt: "You are a helpful assistant.",  // rules
});

// 3. Run it
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



### When to use LangChain (from docs)

Use LangChain when you want to:

- Quickly build agents and autonomous apps
- Use standard abstractions for models, tools, and agent loops
- Start simple but keep flexibility for advanced features
- Build straightforward agents without complex orchestration

Use **LangGraph** later when you need:

- Multi-step workflows (Notion → Calendar → Email)
- Conditional branching
- Long-running stateful agents

---



### Summary (copy into `chapter-4.md`)

```markdown
## Introduction to LangChain

**LangChain** = Open-source agent framework for building LLM applications.

> Provides `createAgent`: a minimal, highly configurable agent harness.

**Problem it solves:**
- Without LangChain: manually write API calls, tool loops, memory, error handling
- With LangChain: one standard API, built-in agent loop, swap models easily

**Core formula (still applies):**
> Agent = Model + Harness
> LangChain = the tool that builds the harness for you

**LangChain vs others:**
| Tool | Role |
|------|------|
| LangChain | Framework — easy agent building |
| LangGraph | Runtime — complex workflows (learn later) |
| Deep Agents | Batteries-included — planning, filesystem, subagents |
| LangSmith | Debugging — trace & evaluate agents |

**Key building blocks:**
- `createAgent()` — create an agent
- `model` — which LLM
- `tools` — what actions it can take
- `systemPrompt` — how it behaves
- `messages` — conversation history
- `middleware` — extra harness logic
- `checkpointer` — memory across turns

**Install (Bun):**
```bash
bun add langchain @langchain/core zod @langchain/openai
export OPENAI_API_KEY="your-key"
```

**Built on LangGraph** — you get production features (persistence, HITL) without writing graph code yet.

**Next:** Build a basic CLI chat agent with a system prompt (Step 5)

```

---
```



### Your learning path

```
Step 1 ✅  What is AI & LLM?
Step 2 ✅  What is an Agent?
Step 3 ✅  What is a Harness?
Step 4 ✅  Introduction to LangChain (you are here)
Step 5 →   Build CLI chat agent (system prompt)
Step 6 →   Add tool calling (web search)
Step 7 →   Message objects
Step 8 →   Streaming
Step 9 →   Structured output
...
LangGraph → StateGraph, nodes, edges, workflows
```

---

Say **"Step 5"** when you're ready to build your **CLI chat agent with a system prompt** — the first hands-on LangChain example.
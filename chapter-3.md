Here is **Step 3: What is a Harness?** — building on your Step 2 notes and the [LangChain Agents](https://docs.langchain.com/oss/javascript/langchain/agents.md) and [Context engineering](https://docs.langchain.com/oss/javascript/langchain/context-engineering.md) docs.

---

## Step 3: What is a Harness?

### Quick recap

From Step 2:

> **Agent = Model + Harness**

- **Model** = the brain (LLM)
- **Harness** = everything **around** the brain that makes it work in a real app

---

### What is a Harness? (simple definition)

A **harness** is all the code, rules, and infrastructure that wrap an LLM so it can act like an agent.

From the LangChain docs:

> *"A harness is everything around that loop: the prompt, the tools, and any middleware that shapes the model's behavior."*

**Simple analogy:**


| Real world                                    | AI world    |
| --------------------------------------------- | ----------- |
| A smart person (brain)                        | LLM (model) |
| Their job title, tools, SOPs, memory, manager | Harness     |
| The full employee doing work                  | Agent       |


A brilliant person with no tools, no instructions, and no memory cannot do much.  
Same for an LLM — the **harness** gives it structure.

**One line:**  

> The harness turns a text generator into a **reliable, useful agent**.

---



### What does the harness do?

The harness has one main job:

> **Get the model the right context at the right time for the task.**

That means:

- What instructions to follow
- What conversation history to remember
- Which tools are available
- When to call a tool vs answer directly
- How to handle errors, limits, and safety

---



### The agent loop (harness runs this)

The harness manages this loop:

```
┌─────────────────────────────────────────┐
│              HARNESS                     │
│                                         │
│  1. Model call  → LLM thinks/decides    │
│  2. Tool call   → run action if needed    │
│  3. Repeat until task is done             │
│                                         │
└─────────────────────────────────────────┘
         ↑                    ↑
    System prompt          Tools
    Messages               Memory
    Middleware             Streaming
```

Without the harness, you'd have to write this loop yourself every time.

---



### Core parts of a harness

These are the building blocks you'll use in LangChain:


| Part                  | What it does                | You'll learn in   |
| --------------------- | --------------------------- | ----------------- |
| **System prompt**     | Sets behavior, role, rules  | CLI chat agent    |
| **Tools**             | Lets the agent take actions | Web search        |
| **Messages**          | Conversation history        | Message objects   |
| **Memory / State**    | Remembers past turns        | Short-term memory |
| **Streaming**         | Shows output in real time   | Streaming         |
| **Structured output** | Returns JSON / typed data   | Structured output |
| **Middleware**        | Extra logic between steps   | Advanced topics   |


---



### 1. System prompt (instructions)

Tells the model **how to behave**.

```typescript
systemPrompt: "You are a helpful coding assistant. Be concise."
```

Examples:

- "You are a travel agent"
- "Always respond in Hindi"
- "Never share personal data"

---



### 2. Tools (actions)

Functions the model can call to **do things**, not just talk.

```typescript
tools: [getWeather, webSearch, sendEmail]
```

Flow:

```
Model: "I need weather data" → calls getWeather("Mumbai")
Tool returns: "32°C, sunny"
Model: "It's 32°C and sunny in Mumbai"
```

---



### 3. Messages (conversation history)

The full chat the model sees each turn:

```typescript
messages: [
  { role: "user", content: "Hi" },
  { role: "assistant", content: "Hello!" },
  { role: "user", content: "What's the weather?" },
]
```

Roles: `user`, `assistant`, `system`, `tool`

---



### 4. Memory / State (persistence)

Remembers context across turns.


| Type                   | Scope                | Example                      |
| ---------------------- | -------------------- | ---------------------------- |
| **Short-term (State)** | One conversation     | Chat history, tool results   |
| **Long-term (Store)**  | Across conversations | User preferences, past facts |


---



### 5. Middleware (extra harness layers)

**Middleware** = hooks that run between agent steps to shape behavior.

From the docs, common middleware categories:


| Category               | Purpose              | Example                    |
| ---------------------- | -------------------- | -------------------------- |
| **Context management** | Summarize long chats | Don't overflow token limit |
| **Fault tolerance**    | Retry on failure     | Retry API call 3 times     |
| **Guardrails**         | Safety rules         | Block PII in responses     |
| **Steering**           | Human approval       | Ask before deleting files  |
| **Planning**           | Break down tasks     | Todo list, subagents       |


Think of middleware as **plugins for the harness**.

---



### Harness levels (LangChain ecosystem)


| Level                       | What                       | Harness style                            |
| --------------------------- | -------------------------- | ---------------------------------------- |
| **LangChain** `createAgent` | Configurable harness       | You pick tools, prompt, middleware       |
| **Deep Agents**             | Batteries-included harness | Planning, filesystem, subagents built in |
| **LangGraph**               | Low-level runtime          | You design the full workflow graph       |


For your course, you start with `createAgent` — a ready-made harness you configure.

---



### Minimal harness example

```typescript
import { createAgent, tool } from "langchain";

const agent = createAgent({
  // ── MODEL (brain) ──
  model: "openai:gpt-4",

  // ── HARNESS (everything below) ──
  systemPrompt: "You are a helpful assistant.",  // instructions
  tools: [getWeather],                            // actions
  // + agent loop, message handling, tool execution (built-in)
});

await agent.invoke({
  messages: [{ role: "user", content: "Weather in Mumbai?" }],
});
```

What LangChain's harness handles for you:

- The model ↔ tool loop
- Message formatting
- Tool execution
- Error handling basics

---



### Why the harness matters

Most agent failures are **not** because the model is too weak — they're because the **wrong context** was given.

From the docs:

> *"When agents fail, it's usually because the LLM call inside the agent took the wrong action. More often than not — it's because the 'right' context was not passed to the LLM."*

So your job as a builder is **context engineering** — designing the harness well:

- Clear system prompt
- Good tool descriptions
- Relevant message history
- Right middleware

---



### Visual: Model vs Harness

```
┌──────────────────────────────────────────────────┐
│                    AGENT                          │
│                                                   │
│  ┌─────────────┐    ┌──────────────────────────┐  │
│  │   MODEL     │    │        HARNESS           │  │
│  │             │    │                          │  │
│  │  GPT-4      │    │  • System prompt         │  │
│  │  Claude     │    │  • Tools                 │  │
│  │  Gemini     │    │  • Messages / memory     │  │
│  │             │    │  • Agent loop            │  │
│  │  (brain)    │    │  • Middleware            │  │
│  │             │    │  • Streaming             │  │
│  └─────────────┘    │  • Structured output     │  │
│                     │                          │  │
│                     │  (body + rules + infra)  │  │
│                     └──────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---



### Summary (copy into `chapter-3.md`)

```markdown
## What is a Harness?

**Harness** = Everything around the LLM that makes it a useful agent.

> Agent = Model + Harness

**Job of the harness:**
Get the model the right context at the right time.

**Core parts:**
| Part | Role |
|------|------|
| System prompt | Instructions / behavior |
| Tools | Actions the agent can take |
| Messages | Conversation history |
| Memory / State | Remember past turns |
| Agent loop | Model → Tool → Model until done |
| Middleware | Extra logic (retries, guardrails, summarization) |
| Streaming | Real-time output |
| Structured output | Typed / JSON responses |

**Simple analogy:**
- Model = smart employee (brain)
- Harness = job description + tools + memory + manager (everything else)
- Agent = employee actually doing the work

**LangChain's role:**
`createAgent()` gives you a ready-made, configurable harness.
You don't write the loop yourself — you configure it.

**Key insight:**
Agents fail mostly because of bad context, not a weak model.
Good harness design = reliable agents.

**Next:** Introduction to LangChain → then build a CLI chat agent
```

---



### Your learning path from here

```
Step 1 ✅  LLM (brain)
Step 2 ✅  Agent = Model + Harness
Step 3 ✅  Harness (you are here)
Step 4 →   Introduction to LangChain
Step 5 →   Build CLI chat agent (system prompt)
Step 6 →   Add tool calling (web search)
...
```

Say **"Step 4"** when you want **Introduction to LangChain** — what it is, why it exists, and how it fits with LangGraph.
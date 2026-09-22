## What is a Harness?

### Definition

> **Agent = Model + Harness**

- **Model** = the brain (LLM)
- **Harness** = everything **around** the brain that makes it work in a real app

A **harness** is all the code, rules, and infrastructure that wrap an LLM so it can act like an agent.

From the [LangChain docs](https://docs.langchain.com/oss/javascript/langchain/overview):

> *"A harness is everything around that loop: the prompt, the tools, and any middleware that shapes the model's behavior."*

**Simple analogy:**

| Real world | AI world |
|------------|----------|
| A smart person (brain) | LLM (model) |
| Their job title, tools, SOPs, memory, manager | Harness |
| The full employee doing work | Agent |

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

```
┌─────────────────────────────────────────┐
│              HARNESS                     │
│                                         │
│  1. Model call  → LLM thinks/decides    │
│  2. Tool call   → run action if needed  │
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

| Part | What it does |
|------|--------------|
| **System prompt** | Sets behavior, role, rules |
| **Tools** | Lets the agent take actions |
| **Messages** | Conversation history |
| **Memory / State** | Remembers past turns |
| **Streaming** | Shows output in real time |
| **Structured output** | Returns JSON / typed data |
| **Middleware** | Extra logic between steps |

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

| Type | Scope | Example |
|------|-------|---------|
| **Short-term (State)** | One conversation | Chat history, tool results |
| **Long-term (Store)** | Across conversations | User preferences, past facts |

---

### 5. Middleware (extra harness layers)

**Middleware** = hooks that run between agent steps to shape behavior.

| Category | Purpose | Example |
|----------|---------|---------|
| **Context management** | Summarize long chats | Don't overflow token limit |
| **Fault tolerance** | Retry on failure | Retry API call 3 times |
| **Guardrails** | Safety rules | Block PII in responses |
| **Steering** | Human approval | Ask before deleting files |
| **Planning** | Break down tasks | Todo list, subagents |

---

### Harness levels (LangChain ecosystem)

| Level | What | Harness style |
|-------|------|---------------|
| **LangChain** `createAgent` | Configurable harness | You pick tools, prompt, middleware |
| **Deep Agents** | Batteries-included harness | Planning, filesystem, subagents built in |
| **LangGraph** | Low-level runtime | You design the full workflow graph |

`createAgent` is a ready-made harness you configure.

---

### Minimal harness example

```typescript
import { createAgent, tool } from "langchain";

const agent = createAgent({
  // ── MODEL (brain) ──
  model: "openai:gpt-4",

  // ── HARNESS (everything below) ──
  systemPrompt: "You are a helpful assistant.",
  tools: [getWeather],
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

Your job as a builder is **context engineering**:

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

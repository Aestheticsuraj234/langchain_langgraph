## What is LangGraph?

> Based on [LangGraph overview](https://docs.langchain.com/oss/javascript/langgraph/overview) and [Frameworks vs runtimes](https://docs.langchain.com/oss/javascript/concepts/products.md)

---

### Quick recap (where you are)

```
Step 1–3 ✅  AI, LLM, Agent, Harness
Step 4–9  ✅  LangChain (agent, tools, messages, streaming, structured output)
Step 10 →  LangGraph (orchestration layer underneath)
```

---

### What is LangGraph? (simple definition)

**LangGraph** is a **low-level orchestration framework and runtime** for building, managing, and deploying **long-running, stateful agents**.

From the docs:

> *"LangGraph is a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents."*

**Simple analogy:**

| Real world | LangGraph |
|------------|-----------|
| A flowchart on a whiteboard | Your workflow design |
| Workers at each step | **Nodes** (functions) |
| Arrows between steps | **Edges** (routing) |
| Shared clipboard everyone updates | **State** (shared data) |

**One line:**  
> LangGraph lets you build **workflows as graphs** — with memory, loops, and control over every step.

---

### LangGraph vs LangChain (important!)

| | LangChain | LangGraph |
|---|-----------|-----------|
| **Level** | High-level **framework** | Low-level **runtime** |
| **Best for** | Quick agents, standard loops | Complex workflows, custom control |
| **You define** | Model, tools, prompt | Nodes, edges, state, routing |
| **Abstraction** | `createAgent()` hides the loop | You design the loop yourself |
| **Relationship** | Built **on top of** LangGraph | The engine underneath |

From the docs:

> *"LangChain 1.0 is built on top of LangGraph."*  
> *"You don't need to know LangGraph to use LangChain — but LangGraph gives you fine-grained control when you need it."*

```
LangChain createAgent()  →  wraps a pre-built LangGraph graph
LangGraph StateGraph     →  you build the graph yourself
```

---

### What LangGraph is NOT

- ❌ Not a chatbot library
- ❌ Not a replacement for LangChain (they work together)
- ❌ Not only for AI — nodes can be **plain code** or **LLM calls**
- ❌ Not a model provider (still uses OpenAI, etc.)

---

### Core idea: model workflows as graphs

LangGraph models agent workflows as **graphs** with three building blocks:

```
┌─────────────────────────────────────────┐
│              LANGGRAPH                   │
│                                         │
│  STATE   → shared data (messages, etc.) │
│  NODES   → functions that do work       │
│  EDGES   → rules for what runs next     │
│                                         │
└─────────────────────────────────────────┘
```

From the docs:

> *"Nodes do the work, edges tell what to do next."*

---

### Key capabilities (why it exists)

| Capability | Meaning |
|------------|---------|
| **Mix deterministic + AI steps** | Some nodes = fixed code, others = LLM |
| **Persistence** | Survive crashes, resume later |
| **Human-in-the-loop** | Pause, inspect, approve, edit state |
| **Memory** | Short-term (thread) + long-term (cross-session) |
| **Streaming** | Stream steps and tokens as they happen |
| **Durable execution** | Long-running tasks that don't lose progress |

---

### Minimal hello-world (from docs)

```typescript
import { StateSchema, MessagesValue, StateGraph, START, END } from "@langchain/langgraph";

const State = new StateSchema({
  messages: MessagesValue,
});

const mockLlm = (state) => {
  return { messages: [{ role: "ai", content: "hello world" }] };
};

const graph = new StateGraph(State)
  .addNode("mock_llm", mockLlm)
  .addEdge(START, "mock_llm")
  .addEdge("mock_llm", END)
  .compile();

await graph.invoke({ messages: [{ role: "user", content: "hi!" }] });
```

Flow: `START → mock_llm → END`

---

### LangGraph in the ecosystem

```
Deep Agents   →  batteries-included (planning, filesystem, subagents)
LangChain     →  easy agent building (createAgent)
LangGraph     →  orchestration runtime (YOU ARE HERE)
LangSmith     →  tracing, debugging, deployment
```

---

### When to reach for LangGraph

Use LangGraph when you need:

- Multi-step workflows (Notion → Calendar → Email)
- Conditional branching ("if X, go to node A, else node B")
- Human approval before an action
- Agents that run for a long time and must resume
- Full control over orchestration

Stick with **LangChain `createAgent`** when a simple agent loop is enough.

---

### Summary

**LangGraph** = graph-based runtime for stateful AI workflows.

- **State** = shared data
- **Nodes** = work (code or LLM)
- **Edges** = routing
- Built for production: persistence, HITL, streaming
- LangChain agents run on LangGraph under the hood

**Next:** What is the use of LangGraph? (concrete use cases)

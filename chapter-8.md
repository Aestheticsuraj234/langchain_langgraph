## What is the use of LangGraph?

> Based on [LangGraph overview](https://docs.langchain.com/oss/javascript/langgraph/overview) and [When to use LangGraph](https://docs.langchain.com/oss/javascript/concepts/products.md)

---

### Why use LangGraph?

LangChain's `createAgent()` is great for **standard agent loops**.  
LangGraph is for when you need **custom orchestration** that a simple loop can't express.

**One line:**  
> Use LangGraph when your app is a **workflow**, not just a chat loop.

---

### LangChain agent loop vs LangGraph workflow

**LangChain (fixed loop):**
```
User → Model → Tool? → Model → Tool? → Model → Answer
```

**LangGraph (your design):**
```
START → fetch_data → analyze → [need human?] → approve → send_email → END
                          ↓ yes
                      wait_for_human → resume → send_email → END
```

You choose every step and branch.

---

### 6 main use cases

#### 1. Complex multi-step workflows

Chain steps that aren't just "model + tool":

```
Read Notion → summarize → check calendar → draft email → send
```

Each step = a **node**. Order and branching = **edges**.

---

#### 2. Deterministic + AI steps together

| Step type | Example | Node can be |
|-----------|---------|-------------|
| Deterministic | Validate JSON, call REST API | Plain JavaScript |
| Agentic | "Decide next action" | LLM call |

From the docs:

> *"Mix deterministic steps with LLM-driven agentic steps in a single graph."*

---

#### 3. Human-in-the-loop (HITL)

Pause the graph, show state to a human, then continue:

```
Agent wants to delete file → INTERRUPT → human approves → resume → delete
```

Use cases: approvals, editing drafts, compliance.

---

#### 4. Long-running & durable agents

- Task runs for hours/days
- Server crashes → **resume from last checkpoint**
- User closes browser → conversation continues later

Requires a **checkpointer** (e.g. `MemorySaver`, database).

---

#### 5. Conditional routing

Route based on state, not only on tool calls:

```typescript
if (state.needsReview) return "human_review";
return "auto_publish";
```

**Conditional edges** — covered in a later chapter (nodes, edges).

---

#### 6. Production deployment

LangGraph supports:

- Streaming (`stream`, `streamEvents`)
- Persistence (thread IDs, checkpoints)
- Debugging with LangSmith (trace each node)
- LangSmith Deployment for hosted agents

---

### LangChain vs LangGraph — decision guide

| Your need | Use |
|-----------|-----|
| CLI chat agent with tools | LangChain `createAgent` ✅ (what you built) |
| Simple web search agent | LangChain ✅ |
| Notion + Calendar + Email pipeline | LangGraph |
| Approval before sending email | LangGraph |
| Multi-agent (researcher + writer) | LangGraph (or Deep Agents) |
| Resume after server restart | LangGraph + checkpointer |

---

### What LangGraph gives you that `createAgent` hides

| Feature | LangChain | LangGraph |
|---------|-----------|-----------|
| Agent loop | Automatic | You define nodes/edges |
| Tool calling | Built-in | You wire it in nodes |
| Branching | Limited | Full conditional edges |
| Human approval | Middleware | Native `interrupt()` |
| Checkpoint/resume | Via checkpointer on agent | First-class in graph |
| Parallel nodes | No | Yes (multiple edges) |

---

### Real-world examples (conceptual — no code yet)

| App | Graph idea |
|-----|------------|
| **Support bot** | classify → search KB → draft → human review → send |
| **Research agent** | search → extract → summarize → store → report |
| **Notion + Calendar** | read Notion → parse tasks → check calendar → suggest slots |
| **Code reviewer** | read PR → lint → LLM review → post comment |

You'll build examples like these later.

---

### How this connects to your project

Your current `src/index.js` uses LangChain:

```javascript
createAgent({ model, tools, responseFormat })
```

Under the hood, that's already a LangGraph graph. When you outgrow it — e.g. "after web search, always ask human before posting" — you expose or rebuild that flow with **StateGraph**.

---

### Summary

**Use LangGraph when:**

1. Workflow has **many steps** beyond model ↔ tool
2. You need **if/else routing** between steps
3. You need **human approval** mid-flow
4. Jobs must **survive restarts**
5. You want **full control** over orchestration

**Stick with LangChain when:**

- Simple chat + tools + structured output is enough

**Next:** What is StateGraph? (the main class you'll use)

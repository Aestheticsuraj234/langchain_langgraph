## Nodes, Edges, and Conditional Routing

> Based on [Graph API overview](https://docs.langchain.com/oss/javascript/langgraph/graph-api)

---

### Nodes

A **node** is a function that does work. It receives the current **state**, runs logic, and returns a **partial update**.

Nodes can be:

- Plain JavaScript (API calls, validation, formatting)
- LLM calls (summarize, classify, generate)
- Anything async

```typescript
async function writeNotes(state) {
  const reply = await llm.invoke(`Write notes on: ${state.topic}`);
  return { notes: reply.content };
}
```

From the docs:

> *"Nodes and edges are nothing more than functions — they can contain an LLM or just good ol' code."*

Register a node:

```typescript
graph.addNode("writeNotes", writeNotes);
```

---

### Normal edges (fixed routing)

An **edge** says what runs next. A **normal edge** always goes to the same next node.

```typescript
import { START, END } from "@langchain/langgraph";

graph
  .addEdge(START, "writeNotes")
  .addEdge("writeNotes", "saveToNotion")
  .addEdge("saveToNotion", END);
```

Visual:

```
START → writeNotes → saveToNotion → END
```

Use normal edges when the path never changes.

---

### Conditional edges (dynamic routing)

A **conditional edge** picks the next node based on **state** at runtime.

From the docs:

> *"If you want to optionally route to one or more edges, you can use the `addConditionalEdges` method."*

```typescript
function routeAfterReview(state) {
  if (state.needsHumanReview) return "human_review";
  return "auto_publish";
}

graph.addConditionalEdges("analyze", routeAfterReview);
```

With explicit path map:

```typescript
graph.addConditionalEdges("analyze", routeAfterReview, {
  human_review: "human_review",
  auto_publish: "auto_publish",
});
```

Visual:

```
START → analyze → [needs review?]
                    ├─ yes → human_review → publish → END
                    └─ no  → auto_publish → END
```

---

### Conditional entry point

Start at different nodes depending on input:

```typescript
function pickStart(state) {
  if (state.mode === "fast") return "quick_summary";
  return "deep_research";
}

graph.addConditionalEdges(START, pickStart);
```

---

### Nodes vs edges — quick comparison

| | Node | Edge |
|---|------|------|
| **Job** | Do work, update state | Decide what runs next |
| **Returns** | `{ field: newValue }` | Next node name (conditional) or nothing (normal) |
| **Can call LLM?** | Yes | No — routing only |
| **Example** | `writeNotes`, `sendEmail` | `START → writeNotes` |

> *"Nodes do the work, edges tell what to do next."*

---

### Parallel nodes

Multiple edges from one node can activate **parallel** branches in the same super-step:

```
START → fetch_notion ─┐
       fetch_calendar ┴→ merge → summarize → END
```

Each fetch node runs independently, then merge combines results.

---

### `Command` (update state + route)

When you need to **update state and route** in one step, return a `Command`:

```typescript
import { Command } from "@langchain/langgraph";

async function reviewNode(state) {
  if (state.approved) {
    return new Command({
      update: { status: "published" },
      goto: "publish",
    });
  }
  return new Command({ goto: "human_review" });
}
```

Use conditional edges when you only need routing (no state update in the router).

---

### Rules of thumb

1. **One job per node** — easier to debug and test
2. **Normal edges** for fixed pipelines
3. **Conditional edges** for if/else, loops, human approval gates
4. **Don't mix** normal edges and dynamic routing from the same node
5. **Always `.compile()`** before running

---

### Summary

| Concept | API | Use when |
|---------|-----|----------|
| Node | `.addNode(name, fn)` | Do work |
| Normal edge | `.addEdge(A, B)` | A always → B |
| Conditional edge | `.addConditionalEdges(node, fn)` | Branch on state |
| Entry routing | `.addConditionalEdges(START, fn)` | Different start paths |
| Parallel | Multiple edges from one node | Fetch from many sources |

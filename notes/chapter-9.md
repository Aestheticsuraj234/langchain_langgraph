## What is StateGraph?

> Based on [Graph API overview](https://docs.langchain.com/oss/javascript/langgraph/graph-api)

---

### What is StateGraph?

**StateGraph** is the main class in LangGraph for building workflows.

From the docs:

> *"The `StateGraph` class is the main graph class to use. This is parameterized by a user defined `State` object."*

**Simple analogy:**  
StateGraph = a **board game board**:
- **State** = current game situation
- **Nodes** = spaces where actions happen
- **Edges** = paths between spaces
- **compile()** = lock the rules before playing
- **invoke()** = play one round

---

### The 3 parts of every StateGraph

```
1. STATE   → What data flows through the graph
2. NODES   → Functions that read state and return updates
3. EDGES   → What runs after each node
```

| Part | Job | Example |
|------|-----|---------|
| **State** | Shared snapshot | `{ messages: [...], step: "done" }` |
| **Node** | Do work | Call LLM, call API, transform data |
| **Edge** | Route | Always go to B, or branch on condition |

> *"Nodes and edges are nothing more than functions — they can contain an LLM or just code."*

---

### How to build a StateGraph (4 steps)

```
Step 1: Define State     (StateSchema)
Step 2: Add nodes        (.addNode)
Step 3: Add edges        (.addEdge / .addConditionalEdges)
Step 4: Compile          (.compile())  ← required before use!
```

**Minimal example:**

```typescript
import { StateSchema, MessagesValue, StateGraph, START, END } from "@langchain/langgraph";

const State = new StateSchema({
  messages: MessagesValue,
});

const chatbot = (state) => {
  return { messages: [{ role: "ai", content: "Hello!" }] };
};

const graph = new StateGraph(State)
  .addNode("chatbot", chatbot)
  .addEdge(START, "chatbot")
  .addEdge("chatbot", END)
  .compile();

await graph.invoke({ messages: [{ role: "user", content: "Hi" }] });
```

Visual:

```
START → chatbot → END
```

---

### Special nodes: START and END

| Symbol | Meaning |
|--------|---------|
| `START` | Entry — first node(s) when input arrives |
| `END` | Exit — graph stops |

```typescript
graph.addEdge(START, "nodeA");
graph.addEdge("nodeA", END);
```

---

### What is State? (StateSchema)

**State** = the shared data structure every node reads and updates.

```typescript
import { StateSchema, MessagesValue } from "@langchain/langgraph";
import * as z from "zod";

const State = new StateSchema({
  messages: MessagesValue,
  step: z.string(),
  count: z.number().default(0),
});
```

**Field types:**

| Type | Use when |
|------|----------|
| `z.string()`, `z.number()`, etc. | Simple fields — latest update wins |
| `MessagesValue` | Chat messages — append/update by ID |
| `ReducedValue` | Custom merge (e.g. append to array) |
| `UntrackedValue` | Temporary data — not saved in checkpoints |

---

### How nodes update state

Nodes **don't return full state** — only **partial updates**:

```typescript
const myNode = (state) => {
  return { count: state.count + 1 };
};
```

LangGraph merges updates using **reducers** per field.

---

### Reducers

| Reducer | Behavior | Example field |
|---------|----------|---------------|
| **Default** | Replace with new value | `step: "done"` |
| **MessagesValue** | Append messages, update by ID | `messages` |
| **ReducedValue** | Custom (e.g. concat arrays) | `allSteps: [...]` |

---

### Why `.compile()` is required

From the docs:

> *"You MUST compile your graph before you can use it."*

`compile()`:

- Validates structure (no orphan nodes, etc.)
- Enables checkpointer, breakpoints, cache
- Returns a runnable graph

```typescript
const graph = new StateGraph(State)
  .addNode(...)
  .addEdge(...)
  .compile({ checkpointer: new MemorySaver() });
```

---

### Running a compiled graph

```typescript
const result = await graph.invoke({ messages: [...] });

await graph.invoke(input, {
  configurable: { thread_id: "user-123" },
});

for await (const chunk of await graph.stream(input, { streamMode: "updates" })) {
  console.log(chunk);
}
```

---

### Execution model (super-steps)

LangGraph runs in **super-steps** (message passing, inspired by Pregel):

1. Active nodes run
2. They emit updates
3. Updates merge into state
4. Next nodes activate based on edges
5. Repeat until all reach `END`

Nodes on the same super-step can run **in parallel**.

---

### Summary

**StateGraph** = builder for LangGraph workflows.

| Concept | Remember |
|---------|----------|
| `StateSchema` | Define shared state |
| `.addNode(name, fn)` | Add a step |
| `.addEdge(A, B)` | A always → B |
| `.addConditionalEdges` | Branch on condition |
| `START` / `END` | Entry / exit |
| `.compile()` | Required before run |
| `.invoke()` / `.stream()` | Execute |

**Build order:** State → Nodes → Edges → Compile → Invoke

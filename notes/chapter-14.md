## Workflow Examples (Notion + Google Calendar)

> Based on [LangGraph Graph API](https://docs.langchain.com/oss/javascript/langgraph/graph-api)

---

### Why workflows?

Some apps need **fixed multi-step pipelines** — not a free-form agent loop.

Examples:

- Research a topic → write notes → save to Notion
- Read tasks from Notion → check Google Calendar → suggest time slots
- Fetch data → validate → summarize → email

LangGraph **StateGraph** is built for this: each step is a **node**, order is defined by **edges**.

---

### Example 1: Notion Notes Workflow

**Goal:** User enters a topic → agent researches → writes markdown notes → creates a Notion page.

**Graph:**

```
START → writeNotes → saveToNotion → END
```

**State:**

```typescript
import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

const State = new StateSchema({
  topic: z.string(),
  notes: z.string().default(""),
  notionUrl: z.string().default(""),
});
```

**Node 1 — writeNotes:** search the web + LLM writes study notes

```typescript
async function writeNotes(state) {
  const search = await tvly.search(state.topic, { maxResults: 5 });
  const research = JSON.stringify(search.results ?? []);

  const reply = await llm.invoke(
    `Write in-depth study notes on: ${state.topic}\n\nWeb research:\n${research}`,
  );

  return { notes: reply.content };
}
```

**Node 2 — saveToNotion:** POST to Notion API

```typescript
async function saveToNotion(state) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { page_id: process.env.NOTION_PAGE_ID },
      properties: {
        title: { title: [{ text: { content: state.topic } }] },
      },
      children: [/* paragraph blocks from state.notes */],
    }),
  });

  const page = await res.json();
  return { notionUrl: page.url };
}
```

**Build and run:**

```typescript
const graph = new StateGraph(State)
  .addNode("writeNotes", writeNotes)
  .addNode("saveToNotion", saveToNotion)
  .addEdge(START, "writeNotes")
  .addEdge("writeNotes", "saveToNotion")
  .addEdge("saveToNotion", END)
  .compile();

const result = await graph.invoke({ topic: "LangGraph basics" });
console.log("Notion page:", result.notionUrl);
```

See `workflow/index.js` in this repo for the full working version.

---

### Example 2: Notion + Google Calendar (conceptual)

**Goal:** Read tasks from Notion → check free slots on Google Calendar → suggest meeting times.

**Graph with conditional routing:**

```
START → readNotion → parseTasks → checkCalendar → suggestSlots → END
                                        ↓
                              [no tasks?] → END
```

**State:**

```typescript
const State = new StateSchema({
  tasks: z.array(z.object({ title: z.string(), due: z.string().optional() })).default([]),
  freeSlots: z.array(z.string()).default([]),
  suggestions: z.string().default(""),
});
```

**Nodes:**

| Node | Type | What it does |
|------|------|--------------|
| `readNotion` | Deterministic | Notion API — fetch page blocks |
| `parseTasks` | LLM | Extract task list from raw text |
| `checkCalendar` | Deterministic | Google Calendar API — free/busy |
| `suggestSlots` | LLM | Match tasks to available slots |

**Conditional edge after parseTasks:**

```typescript
function afterParse(state) {
  if (state.tasks.length === 0) return END;
  return "checkCalendar";
}

graph.addConditionalEdges("parseTasks", afterParse);
```

---

### Deterministic vs AI nodes

| Node | Best as | Why |
|------|---------|-----|
| API calls (Notion, Calendar) | Plain code | Exact, testable, no hallucination |
| Summarize / classify / draft | LLM | Needs language understanding |
| Validate JSON / format dates | Plain code | Rules are fixed |

Mix both in one graph — that's a core LangGraph strength.

---

### Environment setup

**Notion:**

```bash
NOTION_API_KEY=secret_...
NOTION_PAGE_ID=your-parent-page-id
```

Create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations) and share the parent page with it.

**Google Calendar:**

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

Use OAuth2 or a service account depending on your app.

**Tavily (research):**

```bash
TAVILY_API_KEY=tvly-...
```

---

### Run the Notion workflow

```bash
cd workflow
bun install
bun run index.js
```

```
Topic: LangGraph StateGraph
Notion page: https://notion.so/...
```

---

### Tips for production workflows

1. **Split API logic into separate nodes** — easier to retry one step
2. **Add a checkpointer** — resume if Notion API fails mid-run
3. **Use conditional edges** — skip calendar check when there are no tasks
4. **Stream with `streamMode: "updates"`** — show progress in the UI
5. **Trace with LangSmith** — see which node failed

---

### Summary

- Workflows = **StateGraph** + **nodes** (steps) + **edges** (order)
- Notion example: research → write → save (linear pipeline)
- Calendar example: read → parse → check → suggest (with branching)
- Use **plain code** for APIs, **LLM** for language tasks
- Full Notion demo lives in `workflow/index.js`

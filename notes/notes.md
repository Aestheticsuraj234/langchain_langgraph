# LangChain & LangGraph — Course Notes

> Source: [LangChain JS docs](https://docs.langchain.com/oss/javascript/langchain/overview) · [LangGraph JS docs](https://docs.langchain.com/oss/javascript/langgraph/overview)

---

## Part 1 — Foundations

| # | Topic | File |
|---|-------|------|
| 1 | What is AI and LLM? | `chapter-1.md` |
| 2 | What is an AI Agent? (Model + Harness) | `chapter-2.md` |
| 3 | What is a Harness? | `chapter-3.md` |

---

## Part 2 — LangChain (build agents)

| # | Topic | File |
|---|-------|------|
| 4 | Introduction to LangChain | `chapter-4.md` |
| 5 | Build a CLI chat agent · system prompt | `chapter-5.md` |
| 6 | Tool calling · web search | `chapter-10.md` |
| 7 | Message objects · role, content, metadata | `chapter-6.md` |
| 8 | Stream the output | `chapter-11.md` |
| 9 | Structured output | `chapter-12.md` |

**Hands-on:** `src/index.js` — CLI agent with tools + structured output

---

## Part 3 — LangGraph (build workflows)

| # | Topic | File |
|---|-------|------|
| 10 | What is LangGraph? | `chapter-7.md` |
| 11 | What is the use of LangGraph? | `chapter-8.md` |
| 12 | What is StateGraph? | `chapter-9.md` |
| 13 | Nodes, edges, conditional routing | `chapter-13.md` |
| 14 | Workflow examples · Notion, Google Calendar | `chapter-14.md` |

**Hands-on:** `workflow/index.js` — research topic → write notes → save to Notion

---

## Core formula

> **Agent = Model + Harness**

- **Model** — the LLM (brain)
- **Harness** — prompt, tools, messages, loop, middleware
- **LangChain** — configurable harness via `createAgent()`
- **LangGraph** — low-level graph runtime for custom workflows

import "dotenv/config";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { tavily } from "@tavily/core";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import * as z from "zod";

const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const State = new StateSchema({
  topic: z.string(),
  notes: z.string().default(""),
  notionUrl: z.string().default(""),
});

async function writeNotes(state) {
  const search = await tvly.search(state.topic, { maxResults: 5 });
  const research = JSON.stringify(search.results ?? []);

  const reply = await llm.invoke(
    `Write in-depth study notes on: ${state.topic}\n\nWeb research:\n${research}\n\nUse markdown with headings and bullet points.`,
  );

  return { notes: reply.content };
}

async function saveToNotion(state) {
  const blocks = [];
  for (let i = 0; i < state.notes.length; i += 2000) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: state.notes.slice(i, i + 2000) } },
        ],
      },
    });
  }

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
      children: blocks,
    }),
  });

  const page = await res.json();
  return { notionUrl: page.url };
}

const graph = new StateGraph(State)
  .addNode("writeNotes", writeNotes)
  .addNode("saveToNotion", saveToNotion)
  .addEdge(START, "writeNotes")
  .addEdge("writeNotes", "saveToNotion")
  .addEdge("saveToNotion", END)
  .compile();

const rl = readline.createInterface({ input: stdin, output: stdout });
console.log("Notion Notes Workflow — LangGraph");
console.log('Enter a topic (or "exit")\n');

while (true) {
  const topic = await rl.question("Topic: ");
  if (topic.trim().toLowerCase() === "exit") break;

  const result = await graph.invoke({ topic });
  console.log("\nNotion page:", result.notionUrl, "\n");
}

rl.close();

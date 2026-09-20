import { tool } from "langchain";
import { z } from "zod";
import { join } from "node:path";
import { createWorkspace } from "./files";

const workspace = createWorkspace(join(import.meta.dir, "../../playground"));

export const listFiles = tool(
  async ({ path }) => {
    console.log(`[tool] list_files → ${path}`);
    return await workspace.list(path);
  },
  {
    name: "list_files",
    description: "List files in a playground folder. Use '.' for the root.",
    schema: z.object({ path: z.string() }),
  },
);

export const readFile = tool(
  async ({ path }) => {
    console.log(`[tool] read_file → ${path}`);
    return await workspace.read(path);
  },
  {
    name: "read_file",
    description: "Read a text file inside playground.",
    schema: z.object({ path: z.string() }),
  },
);

export const writeFile = tool(
  async ({ path, content }) => {
    console.log(`[tool] write_file → ${path}`);
    return await workspace.write(path, content);
  },
  {
    name: "write_file",
    description: "Create or replace a text file inside playground.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

export const editFile = tool(
  async ({ path, oldText, newText }) => {
    console.log(`[tool] edit_file → ${path}`);
    return await workspace.edit(path, oldText, newText);
  },
  {
    name: "edit_file",
    description: "Replace text in an existing playground file.",
    schema: z.object({ path: z.string(), oldText: z.string(), newText: z.string() }),
  },
);

export const basicTools = [listFiles, readFile, writeFile];
export const codingTools = [...basicTools, editFile];

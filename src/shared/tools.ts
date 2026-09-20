import { tool } from "langchain";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { createWorkspace } from "./files";

const workspace = createWorkspace(fileURLToPath(new URL("../../playground/", import.meta.url)));

// Return tool failures as observations, allowing the agent to correct its input.
async function observe(name: string, path: string, action: () => Promise<string>) {
  console.log(`[tool] ${name} → ${path}`);
  try { return await action(); }
  catch (error) { return `Tool error: ${error instanceof Error ? error.message : String(error)}`; }
}

export const listFiles = tool(
  ({ path }) => observe("list_files", path, () => workspace.list(path)),
  {
    name: "list_files",
    description: "List one directory inside playground. Use '.' for its root; call again for subdirectories.",
    schema: z.object({ path: z.string().describe("Relative directory path, e.g. '.' or 'src'") }),
  },
);

export const readFile = tool(
  ({ path }) => observe("read_file", path, () => workspace.read(path)),
  {
    name: "read_file",
    description: "Read a UTF-8 text file inside playground. Read existing files before changing them.",
    schema: z.object({ path: z.string() }),
  },
);

export const writeFile = tool(
  ({ path, content }) => observe("write_file", path, () => workspace.write(path, content)),
  {
    name: "write_file",
    description: "Create or replace a text file inside playground. Supply its entire content. Creates parent directories.",
    schema: z.object({ path: z.string(), content: z.string() }),
  },
);

export const editFile = tool(
  ({ path, oldText, newText }) => observe("edit_file", path, () => workspace.edit(path, oldText, newText)),
  {
    name: "edit_file",
    description: "Replace one exact unique text occurrence in an existing playground file. Read it first.",
    schema: z.object({ path: z.string(), oldText: z.string().min(1), newText: z.string() }),
  },
);

export const basicTools = [listFiles, readFile, writeFile];
export const codingTools = [...basicTools, editFile];

import { readdir } from "node:fs/promises";
import { join } from "node:path";

export function createWorkspace(root: string) {
  const file = (path: string) => join(root, path);

  return {
    async list(path: string) {
      const entries = await readdir(file(path), { withFileTypes: true });
      return entries.map((entry) => entry.name + (entry.isDirectory() ? "/" : "")).join("\n");
    },

    async read(path: string) {
      return await Bun.file(file(path)).text();
    },

    async write(path: string, content: string) {
      await Bun.write(file(path), content);
      return `Saved ${path}`;
    },

    async edit(path: string, oldText: string, newText: string) {
      const content = await Bun.file(file(path)).text();
      await Bun.write(file(path), content.replace(oldText, newText));
      return `Saved ${path}`;
    },
  };
}

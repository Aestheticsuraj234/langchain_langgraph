import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

// Support code: a local classroom workspace boundary, not an OS sandbox.
export function createWorkspace(root: string) {
  root = resolve(root);
  async function safePath(input: string) {
    if (isAbsolute(input)) throw new Error("Use a relative path inside playground.");
    const target = resolve(root, input);
    const rel = relative(root, target);
    if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
      throw new Error("Path must stay inside playground.");
    }
    const parts = rel ? rel.split(sep) : [];
    if (parts.some((part) => part.startsWith(".") || part === "node_modules")) {
      throw new Error("Hidden files and node_modules are excluded.");
    }
    // Reject links, including a symlink used as the playground root.
    let cursor = root;
    for (const part of ["", ...parts]) {
      if (part) cursor = join(cursor, part);
      try {
        if ((await lstat(cursor)).isSymbolicLink()) throw new Error("Symlinks are excluded.");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    return target;
  }
  async function list(path: string) {
    const target = await safePath(path);
    await mkdir(root, { recursive: true });
    const entries = await readdir(target, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.name.startsWith(".") && entry.name !== "node_modules" && !entry.isSymbolicLink())
      .map((entry) => entry.name + (entry.isDirectory() ? "/" : ""))
      .sort().join("\n") || "(empty directory)";
  }
  async function read(path: string) {
    const target = await safePath(path);
    const stat = await lstat(target);
    if (!stat.isFile() || stat.size > 100_000) throw new Error("Read a text file under 100 KB.");
    return readFile(target, "utf8");
  }
  async function write(path: string, content: string) {
    const target = await safePath(path);
    if (Buffer.byteLength(content) > 100_000) throw new Error("Keep files under 100 KB.");
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
    return `Saved ${path} (${Buffer.byteLength(content)} bytes).`;
  }
  async function edit(path: string, oldText: string, newText: string) {
    const content = await read(path);
    if (!oldText || content.split(oldText).length !== 2) {
      throw new Error("oldText must match exactly once. Read the file and try again.");
    }
    return write(path, content.replace(oldText, () => newText));
  }
  return { list, read, write, edit };
}

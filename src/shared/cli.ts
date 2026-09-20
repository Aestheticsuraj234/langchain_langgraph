// Bun supports prompt(); terminal plumbing is supplied before the workshop.
export async function runCli(
  title: string,
  reply: (input: string) => Promise<string>,
  reset: () => void,
) {
  console.log(`\n${title}\nType /reset for a new conversation, /exit to quit.\n`);
  while (true) {
    const input = prompt("You:")?.trim();
    if (input == null || input === "/exit") break;
    if (!input) continue;
    if (input === "/reset") {
      reset();
      console.log("Conversation reset. Files stay unchanged.\n");
      continue;
    }
    try {
      console.log(`\nAssistant: ${await reply(input)}\n`);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      // A graph may have stopped with unresolved tool calls. Start a clean thread.
      reset();
      console.log("Started a new conversation after the error; file changes remain.\n");
    }
  }
}

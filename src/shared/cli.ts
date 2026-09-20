export async function runCli(
  title: string,
  reply: (input: string) => Promise<string>,
  reset: () => void,
) {
  console.log(`\n${title}\nType /reset for a new conversation, /exit to quit.\n`);
  while (true) {
    const input = prompt("You:");
    if (!input || input === "/exit") break;
    if (input === "/reset") {
      reset();
      console.log("Conversation reset.\n");
      continue;
    }
    console.log(`\nAssistant: ${await reply(input)}\n`);
  }
}

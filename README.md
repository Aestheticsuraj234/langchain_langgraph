# bun-coding-agent-workshop

CLI coding agent workshop: direct model call → CLI chatbot → LangChain tools → LangGraph agent.

## Setup

```bash
bun install
cp .env.example .env
```

Edit `.env` and set `OPENAI_API_KEY`. Then run from the project root:

```bash
bun run http      # Stage 0: raw OpenAI HTTP
bun run openai    # Stage 1: OpenAI SDK
bun run model     # Stage 2: LangChain model call
bun run chat      # Stage 3: CLI chatbot
bun run tools     # Stage 4: LangChain file tools
bun run agent     # Stage 5: LangGraph coding assistant
bun run typecheck
bun test
```

File tools only operate inside `playground/`. The agent does not execute generated code.

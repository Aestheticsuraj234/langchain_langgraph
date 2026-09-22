## Message Objects (role, content, metadata)

> Based on [LangChain Messages docs](https://docs.langchain.com/oss/javascript/langchain/messages)

---

### What is a message?

In LangChain, a **message** is one unit in a conversation — like one bubble in a chat app.

Every message has three parts:

| Part | What it is | Example |
|------|------------|---------|
| **Role** | Who sent it | `user`, `assistant`, `system`, `tool` |
| **Content** | The actual text/data | `"What's the weather?"` |
| **Metadata** | Extra info (optional) | token usage, tool call IDs, message ID |

**One line:**  
> Messages = the conversation history the model reads and writes.

---

### The 4 message types

```
┌─────────────────────────────────────────────────────────┐
│                    CONVERSATION                          │
│                                                         │
│  system    →  Rules for the agent (your systemPrompt)   │
│  user      →  What YOU type                             │
│  assistant →  What the MODEL replies (may call tools)   │
│  tool      →  Result after a tool runs                  │
└─────────────────────────────────────────────────────────┘
```

#### 1. System message (`role: "system"`)

Instructions for the model — behavior, role, rules.

Usually set via `systemPrompt` in `createAgent`, not typed in the CLI loop.

#### 2. User message (`role: "user"`)

What the user sends:

```javascript
{ role: "user", content: "What's the weather in Mumbai?" }
```

#### 3. Assistant message (`role: "assistant"`)

The model's response. Can include:
- **Text** → final answer
- **Tool calls** → when it wants to run a tool

Example with a tool call:

```javascript
{
  role: "assistant",
  content: "",
  tool_calls: [
    {
      name: "web_search",
      args: { query: "weather Mumbai" },
      id: "call_abc123"
    }
  ]
}
```

#### 4. Tool message (`role: "tool"`)

Result returned **after** a tool runs. The model reads this before answering.

```javascript
{
  role: "tool",
  content: "...search results...",
  tool_call_id: "call_abc123"
}
```

---

### Full agent loop as messages

When you ask: *"What's the weather in Mumbai?"* (with a weather tool)

```
1. [user]      "What's the weather in Mumbai?"
2. [assistant] tool_calls: get_weather({ city: "Mumbai" })
3. [tool]      "32°C, sunny"
4. [assistant] "The weather in Mumbai is 32°C and sunny."
```

That's the **agent loop** expressed as messages.

---

### Two ways to write messages

**Way 1: Dictionary (simplest)**

```javascript
{ role: "user", content: "Hello" }
{ role: "assistant", content: "Hi there!" }
{ role: "system", content: "You are helpful." }
```

**Way 2: LangChain classes (typed)**

```javascript
import { HumanMessage, AIMessage, SystemMessage } from "langchain";

new SystemMessage("You are a helpful assistant.");
new HumanMessage("Hello");
new AIMessage("Hi there!");
```

Dictionary format is fine for most apps.

---

### What is metadata?

Extra fields on a message that aren't the main text.

| Field | On which message | What it stores |
|-------|------------------|----------------|
| `id` | Any | Unique message ID |
| `tool_calls` | Assistant | Tools the model wants to run |
| `tool_call_id` | Tool | Links tool result → tool call |
| `usage_metadata` | Assistant | Token counts (input/output) |
| `response_metadata` | Assistant | Provider info (model name, etc.) |
| `name` | User | Optional user label |

Example — token usage on an AI reply:

```javascript
const last = result.messages.at(-1);
console.log(last.usage_metadata);
// { input_tokens: 120, output_tokens: 45, total_tokens: 165 }
```

---

### `content` can be more than text

For most apps, `content` is a **string**. Later it can be multimodal:

```javascript
content: [
  { type: "text", text: "What's in this image?" },
  { type: "image_url", image_url: { url: "https://..." } }
]
```

---

### How messages connect to agent state

From the [LangChain docs](https://docs.langchain.com/oss/javascript/langchain/messages):

> Every agent manages execution through messages. The built-in field is `messages` — full conversation history for the current thread. **Append-only**: new messages are added, never replaced.

When you call:

```javascript
agent.invoke({ messages: [{ role: "user", content: question }] })
```

Each turn adds new messages inside that run.  
To remember past turns across CLI loops, add a `checkpointer` + `thread_id`.

---

### Quick reference

| Role | Who | Typical source |
|------|-----|----------------|
| `system` | Instructions | `systemPrompt` in `createAgent` |
| `user` | You | CLI input |
| `assistant` | Model | Final answer + `tool_calls` |
| `tool` | Tool output | Search / API results |

---

### Inspect the full message chain

Add this temporarily to see every message in one run:

```javascript
console.log(JSON.stringify(result.messages, null, 2));
```

You'll see `user` → `assistant` (with `tool_calls`) → `tool` → `assistant`.

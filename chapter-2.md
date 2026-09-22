## Step 2: What is an AI Agent? (Model + Harness)

### From LLM to Agent

In Step 1, you learned:
- **LLM** = the brain (generates text)
- **Agent** = brain + ability to **do things**

An **AI Agent** is not just a chatbot that replies once. It is a system that:
1. Understands a goal
2. Decides what to do
3. Uses tools if needed
4. Keeps going until the task is done

**Simple analogy:**  
A chatbot is like asking someone a question and getting one answer.  
An agent is like hiring an assistant who can **think, search, call APIs, and keep working** until the job is finished.

---

### The core formula (from LangChain docs)

> **Agent = Model + Harness**

| Part | What it is | Role |
|------|------------|------|
| **Model** | The LLM (GPT, Claude, Gemini…) | The **brain** — reasons and decides |
| **Harness** | Code around the model | The **body + rules** — tools, prompts, memory, loop |

From the docs:

> *"An agent is a model calling tools in a loop until a given task is complete."*  
> *"A harness is everything around that loop: the prompt, the tools, and any middleware that shapes the model's behavior."*

**One line:**  
> The **model** thinks. The **harness** makes it useful and reliable in real apps.

---

### Chatbot vs Agent

| | Chatbot | Agent |
|---|---------|-------|
| **Input** | One question | A goal / task |
| **Output** | One text reply | Actions + final answer |
| **Can use tools?** | Usually no | Yes |
| **Loop?** | Single turn | Multiple steps until done |
| **Example** | "Explain AI" → text answer | "Book me a flight" → search → compare → book |

```
Chatbot:  User → LLM → Answer (done)

Agent:    User → LLM → Tool → LLM → Tool → LLM → Final Answer
                    ↑__________________________|
                         (loop until task done)
```

---

### How the agent loop works (simple)

This is the heart of every LangChain agent:

```
1. User sends a message
2. Model reads it and decides:
   - "I can answer directly" → reply
   - "I need a tool" → call tool (search, weather, DB, etc.)
3. Tool runs and returns result
4. Model reads the result and decides again
5. Repeat until task is complete
```

**Example task:** *"What's the weather in Mumbai?"*

```
User: "What's the weather in Mumbai?"
  ↓
Model: "I need the weather tool" → calls getWeather("Mumbai")
  ↓
Tool returns: "32°C, sunny"
  ↓
Model: "The weather in Mumbai is 32°C and sunny."
  ↓
Done ✅
```


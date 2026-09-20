import { StateGraph, StateSchema, MessagesValue, MemorySaver, START, END } from "@langchain/langgraph";
import { AIMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { CODING_INSTRUCTIONS } from "./instructions";

export const AgentState = new StateSchema({ messages: MessagesValue });

// Injecting the bound model also lets our tests run without an API key.
export function buildCodingGraph(
  modelWithTools: { invoke: (messages: BaseMessage[]) => Promise<AIMessage> },
  tools: StructuredToolInterface[],
) {
  const byName = new Map(tools.map((tool) => [tool.name, tool]));

  async function assistant(state: typeof AgentState.State) {
    console.log("[node] assistant");
    const response = await modelWithTools.invoke([
      new SystemMessage(CODING_INSTRUCTIONS),
      ...state.messages,
    ]);
    return { messages: [response] };
  }

  async function executeTools(state: typeof AgentState.State) {
    console.log("[node] tools");
    const last = state.messages.at(-1);
    if (!AIMessage.isInstance(last)) return { messages: [] };
    const results: ToolMessage[] = [];
    // Sequential execution makes file changes easier to follow in class.
    for (const call of last.tool_calls ?? []) {
      let content: string;
      try {
        const selected = byName.get(call.name);
        if (!selected) throw new Error(`Unknown tool: ${call.name}`);
        content = String(await selected.invoke(call.args));
      } catch (error) {
        content = `Tool error: ${error instanceof Error ? error.message : String(error)}`;
      }
      results.push(new ToolMessage({ content, tool_call_id: call.id!, name: call.name }));
    }
    return { messages: results };
  }

  function routeAfterAssistant(state: typeof AgentState.State) {
    const last = state.messages.at(-1);
    return AIMessage.isInstance(last) && last.tool_calls?.length ? "tools" : END;
  }

  return new StateGraph(AgentState)
    .addNode("assistant", assistant)
    .addNode("tools", executeTools)
    .addEdge(START, "assistant")
    .addConditionalEdges("assistant", routeAfterAssistant, ["tools", END])
    .addEdge("tools", "assistant")
    .compile({ checkpointer: new MemorySaver() });
}

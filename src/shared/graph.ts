import { StateGraph, StateSchema, MessagesValue, MemorySaver, START, END } from "@langchain/langgraph";
import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { CODING_INSTRUCTIONS } from "./instructions";

export const AgentState = new StateSchema({ messages: MessagesValue });

export function buildCodingGraph(modelWithTools: any, tools: any[]) {
  const byName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

  async function assistant(state: any) {
    console.log("[node] assistant");
    const response = await modelWithTools.invoke([
      new SystemMessage(CODING_INSTRUCTIONS),
      ...state.messages,
    ]);
    return { messages: [response] };
  }

  async function executeTools(state: any) {
    console.log("[node] tools");
    const last = state.messages.at(-1);
    const results = [];
    for (const call of last.tool_calls) {
      const content = await byName[call.name].invoke(call.args);
      results.push(new ToolMessage({ content: String(content), tool_call_id: call.id }));
    }
    return { messages: results };
  }

  function routeAfterAssistant(state: any) {
    const last = state.messages.at(-1);
    return last.tool_calls?.length ? "tools" : END;
  }

  return new StateGraph(AgentState)
    .addNode("assistant", assistant)
    .addNode("tools", executeTools)
    .addEdge(START, "assistant")
    .addConditionalEdges("assistant", routeAfterAssistant, ["tools", END])
    .addEdge("tools", "assistant")
    .compile({ checkpointer: new MemorySaver() });
}

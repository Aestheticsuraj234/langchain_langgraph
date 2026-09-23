import "dotenv/config";
import readline from "node:readline/promises";
import {stdin as input , stdout as output} from "node:process";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { visitPage, webSearch } from "./tools/index.js";


const agent = createAgent({
  model:new ChatOpenAI({model:"gpt-4o-mini"}),
  tools:[webSearch, visitPage],
  systemPrompt:"Youa re a helpful assistant. Answer clearly and keep replies short. you also have visit_page for urls , web_search for general search"
});

const rl = readline.createInterface({input , output});

console.log("Chat agent. type 'exit' to quit.\n");

while(true){
  const question = await rl.question("You: ");

  if(question.toLowerCase() === "exit") break;

  const result = await agent.invoke({
    messages:[{role:"human" , content:question}]
  });

  for (const message of result.messages) {
    if (message.tool_calls?.length) {
      for (const call of message.tool_calls) {
        console.log(`Tool: ${call.name}(${JSON.stringify(call.args)})`);
      }
    }
  }

  console.log("Agent:", result.messages.at(-1)?.content, "\n");
  
}

rl.close();

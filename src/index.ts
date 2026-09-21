import { createAgent , tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
    (input)=>`it's always sunny in ${input.city}`,
    {
        name:"get_weather",
        description:"get the weather of a given city",
        schema:z.object({
            city:z.string().describe("the city to get the weather of"),
        })
    }
)


const agent = createAgent({
    model:"gpt-4o-mini",
    tools:[getWeather]
})


  const result = await agent.invoke({
        messages:[
            {role:"user" , content:"what's the weather in Tokyo?"}
    ]
});
console.log(result.messages);

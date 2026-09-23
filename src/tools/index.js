import {tavily} from "@tavily/core";
import {tool} from "langchain";
import * as z from "zod";


const tvly = tavily({apiKey:process.env.TAVILY_API_KEY});

export const webSearch = tool(
    async({query})=>{
        const data = await tvly.search(query , {maxResults:5});
        return JSON.stringify(data.results ?? []);
    },
    {
        name:"web_search",
        description:"Search the web for information",
        schema:z.object({query:z.string().describe("Search query")})
    }
)

export const visitPage = tool(
    async ({ url }) => {
      const data = await tvly.extract([url], {
        extractDepth: "advanced",
        format: "markdown",
      });
      return data.results?.[0]?.rawContent ?? JSON.stringify(data);
    },
    {
      name: "visit_page",
      description: "Read and extract content from a URL.",
      schema: z.object({ url: z.string().describe("URL to read") }),
    },
  );
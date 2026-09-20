import { model } from "./shared/model";

const response = await model.invoke([
  { role: "system", content: "You are a friendly programming tutor. Be concise." },
  { role: "user", content: "Explain an AI agent using a college-library example." },
]);
console.log(response.content);

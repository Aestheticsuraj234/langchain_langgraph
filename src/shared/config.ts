export const MODEL = Bun.env.OPENAI_MODEL || "gpt-4.1-mini";

export function requireApiKey() {
  const key = Bun.env.OPENAI_API_KEY;
  if (!key || key === "replace_with_your_api_key") {
    throw new Error("Set OPENAI_API_KEY in .env first. See .env.example.");
  }
  return key;
}

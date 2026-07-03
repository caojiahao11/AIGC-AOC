import OpenAI from "openai";

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
  timeout: 120_000,
  maxRetries: 2
});

export async function createJsonChatCompletion(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  return deepseek.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    messages,
    response_format: {
      type: "json_object"
    }
  });
}

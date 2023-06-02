import { Configuration, OpenAIApi } from "openai";
import { openAIToken } from "../config";

const configuration = new Configuration({
  apiKey: openAIToken,
});

const openai = new OpenAIApi(configuration);

export async function gptAnswer(question: string): Promise<string> {
  const gpt = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: question }],
  });
  return gpt.data.choices[0].message?.content || 'gpt foi de base kkkkkkk';
}
import { openai } from "../providers/openai";

export async function gptAnswerImage(description: string): Promise<string> {
  try {
    const { data } = await openai.createImage({ size: "1024x1024", prompt: description.replace('gptimg', '') });
    return data.data[0].url || 'gpt foi de base kkkkkkk';
  } catch (error) {
    return error as string;
  }
}
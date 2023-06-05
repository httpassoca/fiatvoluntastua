import { Configuration, OpenAIApi, ImagesResponse } from "openai";
import { openAIToken } from "../config";

const configuration = new Configuration({
  apiKey: openAIToken,
});

const openai = new OpenAIApi(configuration);

export async function gptAnswer(question: string, username: string = 'gay'): Promise<string> {
  try {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question, name: username }],
    });
    console.log(question);
    let answer: string | undefined = data.choices[0].message?.content;
    if (!answer) {
      return 'gpt foi de base kkkkkk'
    }
    if (
      answer.includes('modelo de linguagem') ||
      answer.includes('inteligência artificial') ||
      answer.includes('Como IA')
    ) {
      answer = answer.slice(answer.indexOf('.') + 2, answer.length);
    }
    return answer
  } catch (error) {
    return error as string;
  }
}

export async function gptImg(description: string): Promise<string> {
  try {
    const { data } = await openai.createImage({ size: "1024x1024", prompt: description.replace('gptimg', '') });
    return data.data[0].url || 'gpt foi de base kkkkkkk';
  } catch (error) {
    return error as string;
  }
}
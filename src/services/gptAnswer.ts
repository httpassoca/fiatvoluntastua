import { openai } from "../providers/openai";

export async function gptAnswer(question: string, username: string = 'gay'): Promise<string> {
  try {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question, name: username }],
    });

    let answer: string | undefined = data.choices[0].message?.content;
    if (!answer) {
      return 'gpt foi de base kkkkkk'
    }
    if (
      answer.includes('modelo de linguagem') ||
      answer.includes('inteligência artificial') ||
      answer.includes('Como uma IA') ||
      answer.includes('Como IA')
    ) {
      answer = answer.slice(answer.indexOf('.') + 2, answer.length);
    }
    return answer
  } catch (error) {
    return error as string;
  }
}
import { openai } from "../providers/openai";

export async function gptAnswer(question: string): Promise<string> {
  try {
    const data = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: question }],
    });

    let answer: string | null = data.choices[0].message?.content;
    if (!answer || !data) {
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
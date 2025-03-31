import { openaiApiKey } from "@/config";
import OpenAiApi from "openai";

export const openai = new OpenAiApi({ apiKey: openaiApiKey });
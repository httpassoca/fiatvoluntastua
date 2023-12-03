import OpenAiApi from "openai";
import { openaiApiKey } from "../config";

export const openai = new OpenAiApi({apiKey: openaiApiKey});
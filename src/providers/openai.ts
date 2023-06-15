import { Configuration, OpenAIApi, ImagesResponse } from "openai";
import { openAIToken } from "../config";

const configuration = new Configuration({
  apiKey: openAIToken,
});

export const openai = new OpenAIApi(configuration);
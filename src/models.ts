import { ChatOllama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { CONFIG } from "./config.ts";

export type Provider = "ollama" | "gemini";

export function getModel() {
  const provider: Provider = (CONFIG.provider as Provider) ?? "ollama";
  if (provider === "gemini") {
    return new ChatGoogleGenerativeAI({
      model: CONFIG.geminiModel ?? "gemini-2.5-pro",
      maxOutputTokens: 2048,
      apiKey: CONFIG.geminiApiKey,
    });
  }
  return new ChatOllama({
    model: CONFIG.ollamaModel,
    temperature: 0.2,
    maxRetries: 4,
    baseUrl: CONFIG.ollamaHost,
  });
}



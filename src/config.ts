import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:0.5b",
  ollamaHost: process.env.OLLAMA_HOST, // e.g., http://localhost:11434
  provider: process.env.MODEL_PROVIDER ?? "ollama", // "ollama" | "gemini"
  geminiApiKey: process.env.GOOGLE_API_KEY,
  geminiModel: process.env.GEMINI_MODEL,
} as const;



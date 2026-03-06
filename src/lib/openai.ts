import OpenAI from "openai";

// Singleton OpenAI client — reused across API routes
let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Copy .env.example to .env and add your key."
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

/** Model used for summarization (configurable via env) */
export const SUMMARY_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

/** Model used for transcription */
export const WHISPER_MODEL = process.env.WHISPER_MODEL || "whisper-1";

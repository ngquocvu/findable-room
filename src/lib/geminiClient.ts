// =========================================================
// Gemini Client — Server-side @google/genai wrapper.
// Only called from Next.js API route handlers (never client).
// =========================================================

import { GoogleGenAI } from '@google/genai';

/** Model to use — configurable via env so no code changes needed to swap. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash-lite';

let _client: GoogleGenAI | null = null;

export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Please enter your Gemini API Key in AI Labs or configure GEMINI_API_KEY in .env.local.'
    );
  }
  // Cache client if using default env key and no custom key is specified
  if (!customApiKey && _client) return _client;
  const client = new GoogleGenAI({ apiKey });
  if (!customApiKey) _client = client;
  return client;
}

export interface GeminiGenerateOptions {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  responseSchema?: object;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string;
}

/**
 * Generate a JSON-structured response from Gemini.
 * Automatically retries once on transient network errors.
 */
export async function generateStructuredJSON<T>(opts: GeminiGenerateOptions): Promise<T> {
  const client = getGeminiClient(opts.apiKey);


  const parts: any[] = [];

  if (opts.imageBase64 && opts.imageMimeType) {
    parts.push({
      inlineData: {
        data: opts.imageBase64,
        mimeType: opts.imageMimeType,
      },
    });
  }

  parts.push({ text: opts.prompt });

  const generationConfig: any = {
    temperature: opts.temperature ?? 0.2,
    maxOutputTokens: opts.maxOutputTokens ?? 4096,
    responseMimeType: 'application/json',
  };
  if (opts.responseSchema) {
    generationConfig.responseSchema = opts.responseSchema;
  }

  const attempt = async () => {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts }],
      config: generationConfig,
    });
    const text = response.text?.trim() ?? '';
    if (!text) throw new Error('Empty response from Gemini');
    try {
      return JSON.parse(text) as T;
    } catch {
      // Gemini sometimes wraps JSON in markdown fences
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match) return JSON.parse(match[1]) as T;
      throw new Error(`Could not parse Gemini JSON response: ${text.slice(0, 200)}`);
    }
  };

  try {
    return await attempt();
  } catch (err) {
    // Single retry for transient errors
    console.warn('[geminiClient] Retrying after error:', err);
    return await attempt();
  }
}

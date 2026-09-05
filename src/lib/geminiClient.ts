// =========================================================
// Gemini Client — Server-side @google/genai wrapper.
// Only called from Next.js API route handlers (never client).
// =========================================================

import { GoogleGenAI } from '@google/genai';

/** Model to use — configurable via env so no code changes needed to swap. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
export const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-1.5-flash'];

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

  const callModel = async (modelName: string) => {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts }],
      config: generationConfig,
    });
    const text = response.text?.trim() ?? '';
    if (!text) throw new Error(`Empty response from Gemini model ${modelName}`);
    try {
      return JSON.parse(text) as T;
    } catch {
      // Gemini sometimes wraps JSON in markdown fences
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match) return JSON.parse(match[1]) as T;
      throw new Error(`Could not parse Gemini JSON response: ${text.slice(0, 200)}`);
    }
  };

  const modelsToTry = [GEMINI_MODEL, ...FALLBACK_MODELS.filter(m => m !== GEMINI_MODEL)];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      return await callModel(model);
    } catch (err: any) {
      lastError = err;
      const isNotFound = err?.status === 404 || err?.message?.includes('not found') || err?.message?.includes('is not supported');
      if (isNotFound) {
        console.warn(`[geminiClient] Model ${model} not available, trying next fallback...`);
        continue;
      }
      // For transient errors on the current model, retry once
      try {
        console.warn(`[geminiClient] Retrying model ${model} after transient error:`, err);
        return await callModel(model);
      } catch (retryErr) {
        lastError = retryErr;
      }
    }
  }

  throw lastError;
}

// =========================================================
// Browser AI — Client-side Gemini Nano / window.ai helper.
// Runs item parsing 100% on-device with zero API cost.
// =========================================================

import type { ItemCategory } from '@/src/types';

export interface ParsedItem {
  name: string;
  category: ItemCategory;
  quantity: number;
  tags: string[];
}

export interface BrowserAIResult {
  success: boolean;
  detectedIntent: 'add' | 'replace';
  items: ParsedItem[];
  explanation?: string;
  source: 'browser';
}

/**
 * Check if the browser Prompt API (window.ai) is available and ready.
 * This is a Chromium-specific API, currently in Origin Trial for Chrome 127+.
 */
export function isBrowserAIAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ai' in window &&
    typeof (window as any).ai?.languageModel?.create === 'function'
  );
}

const ITEM_CATEGORIES: ItemCategory[] = [
  'clothing',
  'documents',
  'electronics',
  'tools',
  'books',
  'kitchenware',
  'toys',
  'misc',
];

/**
 * Parse a spoken/typed transcript into structured items using Gemini Nano on-device.
 * Falls back gracefully if window.ai is unavailable or throws.
 */
export async function parseTranscriptWithBrowserAI(
  transcript: string,
  furnitureName: string,
  language: 'vi' | 'en'
): Promise<BrowserAIResult | null> {
  if (!isBrowserAIAvailable()) return null;

  const windowAI = (window as any).ai;

  const prompt = `
You are a smart home inventory assistant. Parse the following voice transcript into a structured list of items to store in a furniture unit.

Furniture: "${furnitureName}"
Transcript: "${transcript}"

Rules:
- Identify each distinct item with name, quantity (default 1 if not mentioned), and category from: ${ITEM_CATEGORIES.join(', ')}
- Detect if the user wants to "add" new items to existing or "replace" all existing items
- Common "replace" signals: "replace all", "thay thế", "xóa cũ", "start fresh", "only keep"
- Assign logical category based on item name
- Suggest 1-3 relevant tags per item
- Output valid JSON only

Response format:
{
  "detectedIntent": "add" | "replace",
  "items": [
    { "name": "item name", "category": "misc", "quantity": 1, "tags": ["tag1"] }
  ],
  "explanation": "brief explanation of what was parsed"
}
`.trim();

  try {
    const session = await windowAI.languageModel.create({
      systemPrompt:
        language === 'vi'
          ? 'You are a helpful assistant that parses Vietnamese and English inventory descriptions.'
          : 'You are a helpful inventory parsing assistant.',
      temperature: 0.2,
      topK: 40,
    });

    const response = await session.prompt(prompt);
    session.destroy();

    const text = response?.trim() ?? '';
    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error('No valid JSON in browser AI response');
    }

    return {
      success: true,
      detectedIntent: parsed.detectedIntent === 'replace' ? 'replace' : 'add',
      items: (parsed.items ?? []).map((item: any) => ({
        name: String(item.name ?? ''),
        category: ITEM_CATEGORIES.includes(item.category) ? item.category : 'misc',
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      })),
      explanation: parsed.explanation,
      source: 'browser',
    };
  } catch (err) {
    console.warn('[browserAI] Parse failed:', err);
    return null;
  }
}

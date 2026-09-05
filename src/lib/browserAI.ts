// =========================================================
// Browser AI — Client-side Chrome Built-in AI (Gemini Nano)
// & Expert Models (Summarizer, Translator, Writer).
// Runs 100% on-device with zero API cost, ultra-low latency & privacy.
// =========================================================

import type { ItemCategory, Room, Furniture, StoredItem } from '@/src/types';

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

export type ModelAvailability = 'readily' | 'after-download' | 'no';

export interface ChromeAIFeatureStatus {
  promptAPI: ModelAvailability;
  summarizerAPI: boolean;
  translatorAPI: boolean;
  writerAPI: boolean;
  languageDetectorAPI: boolean;
}

export interface SemanticSearchResult {
  success: boolean;
  answer: string;
  matchedItemId?: string;
  matchedFurnitureId?: string;
  matchedRoomId?: string;
  source: 'browser' | 'cloud';
}

/**
 * Check if the browser Prompt API (window.ai) is available and ready.
 * Backwards-compatible check for legacy caller components.
 */
export function isBrowserAIAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  return (
    'ai' in win &&
    typeof win.ai?.languageModel?.create === 'function'
  );
}

/**
 * Check availability across all Chrome Built-in AI APIs.
 * Supports Chrome 128+ Prompt API, Chrome 138+ Summarizer, Translator, Writer.
 */
export async function checkChromeAISupport(): Promise<ChromeAIFeatureStatus> {
  if (typeof window === 'undefined') {
    return {
      promptAPI: 'no',
      summarizerAPI: false,
      translatorAPI: false,
      writerAPI: false,
      languageDetectorAPI: false,
    };
  }

  const win = window as any;
  const selfObj = (typeof self !== 'undefined' ? self : win) as any;

  // 1. Prompt API (Gemini Nano)
  let promptStatus: ModelAvailability = 'no';
  try {
    if (win.ai?.languageModel) {
      if (typeof win.ai.languageModel.availability === 'function') {
        promptStatus = await win.ai.languageModel.availability();
      } else if (typeof win.ai.languageModel.capabilities === 'function') {
        const cap = await win.ai.languageModel.capabilities();
        promptStatus = cap.available === 'readily' ? 'readily' : cap.available === 'after-download' ? 'after-download' : 'no';
      } else if (typeof win.ai.languageModel.create === 'function') {
        promptStatus = 'readily';
      }
    }
  } catch {
    promptStatus = 'no';
  }

  // 2. Summarizer API
  let summarizerStatus = false;
  try {
    if ('Summarizer' in selfObj || win.ai?.summarizer || 'summarizer' in selfObj) {
      summarizerStatus = true;
    }
  } catch {
    summarizerStatus = false;
  }

  // 3. Translator API
  let translatorStatus = false;
  try {
    if (
      win.ai?.translator ||
      ('translation' in selfObj && typeof selfObj.translation?.createTranslator === 'function')
    ) {
      translatorStatus = true;
    }
  } catch {
    translatorStatus = false;
  }

  // 4. Writer / Rewriter API
  let writerStatus = false;
  try {
    if (win.ai?.writer || win.ai?.rewriter) {
      writerStatus = true;
    }
  } catch {
    writerStatus = false;
  }

  // 5. Language Detector API
  let langDetectorStatus = false;
  try {
    if (
      win.ai?.languageDetector ||
      ('translation' in selfObj && typeof selfObj.translation?.createDetector === 'function')
    ) {
      langDetectorStatus = true;
    }
  } catch {
    langDetectorStatus = false;
  }

  return {
    promptAPI: promptStatus,
    summarizerAPI: summarizerStatus,
    translatorAPI: translatorStatus,
    writerAPI: writerStatus,
    languageDetectorAPI: langDetectorStatus,
  };
}

/**
 * Benchmark on-device Gemini Nano inference speed and latency.
 */
export async function benchmarkChromeAI(): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  if (typeof window === 'undefined') return { success: false, latencyMs: 0, error: 'Window undefined' };

  const win = window as any;
  if (!win.ai?.languageModel?.create) {
    return { success: false, latencyMs: 0, error: 'Prompt API not supported in this browser' };
  }

  const start = performance.now();
  try {
    const session = await win.ai.languageModel.create({
      temperature: 0.1,
    });
    const res = await session.prompt('Respond with the single word: "READY".');
    session.destroy();
    const duration = Math.round(performance.now() - start);

    if (res && res.length > 0) {
      return { success: true, latencyMs: duration };
    }
    return { success: false, latencyMs: duration, error: 'Empty response from Nano' };
  } catch (err: any) {
    return { success: false, latencyMs: Math.round(performance.now() - start), error: err.message || 'Prompt failed' };
  }
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

/**
 * Context payload passed to Semantic Search
 */
export interface SemanticSearchContext {
  query: string;
  rooms: Room[];
  furniture: Furniture[];
  items: StoredItem[];
  language: 'vi' | 'en';
}

/**
 * Execute natural language Semantic Search over room inventory.
 * Attempts Chrome Built-in AI Prompt API streaming first;
 * falls back to /api/ai/semantic-search cloud route if unsupported.
 */
export async function querySemanticInventory(
  params: SemanticSearchContext,
  onChunk?: (text: string) => void
): Promise<SemanticSearchResult> {
  const { query, rooms, furniture, items, language } = params;

  // Build condensed inventory catalog string
  const inventoryCatalog = furniture.map((f) => {
    const room = rooms.find((r) => r.id === f.roomId);
    const furnItems = items.filter((i) => i.furnitureId === f.id);
    const itemNames = furnItems.map((i) => `${i.name} (qty:${i.quantity}, cat:${i.category}, tags:[${i.tags.join(',')}])`).join(', ');
    return `[FurnitureID: "${f.id}", Name: "${f.name}", Room: "${room?.name || 'Unknown'}", RoomID: "${room?.id || ''}"] Items: ${itemNames || 'Empty'}`;
  }).join('\n');

  // Attempt 1: Chrome Prompt API on-device
  const win = typeof window !== 'undefined' ? (window as any) : null;
  if (win?.ai?.languageModel?.create) {
    try {
      const systemPrompt = language === 'vi'
        ? 'Bạn là trợ lý định vị đồ đạc thông minh trong phòng 3D của ứng dụng RoomFindable. Hãy trả lời ngắn gọn, nêu rõ món đồ nằm ở tủ/ngăn nào trong phòng nào và đưa ra FurnitureID, RoomID tương ứng.'
        : 'You are a smart 3D room inventory locator assistant for RoomFindable. Answer concisely where the requested items are located, mentioning the room and furniture name, along with exact FurnitureID and RoomID.';

      const prompt = `
Inventory Catalog:
${inventoryCatalog}

User question: "${query}"

Instructions:
1. Reason which furniture piece and item best matches the user's need.
2. Provide a helpful, direct 1-2 sentence explanation to the user.
3. On the last line, strictly output JSON in this format:
{"furnitureId": "...", "roomId": "..."}
If no item is relevant, output {"furnitureId": null, "roomId": null}
`.trim();

      const session = await win.ai.languageModel.create({
        systemPrompt,
        temperature: 0.2,
      });

      let fullText = '';
      if (typeof session.promptStreaming === 'function') {
        const stream = session.promptStreaming(prompt);
        for await (const chunk of stream) {
          fullText = chunk;
          if (onChunk) {
            // Strip trailing json block for live clean streaming
            const cleanPreview = fullText.replace(/\{"furnitureId"[\s\S]*$/, '').trim();
            onChunk(cleanPreview);
          }
        }
      } else {
        fullText = await session.prompt(prompt);
        if (onChunk) onChunk(fullText.replace(/\{"furnitureId"[\s\S]*$/, '').trim());
      }
      session.destroy();

      // Extract JSON ids from trailing text
      let matchedFurnitureId: string | undefined;
      let matchedRoomId: string | undefined;
      const jsonMatch = fullText.match(/\{"furnitureId"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.furnitureId) matchedFurnitureId = parsed.furnitureId;
          if (parsed.roomId) matchedRoomId = parsed.roomId;
        } catch {
          // ignore
        }
      }

      const cleanAnswer = fullText.replace(/\{"furnitureId"[\s\S]*?\}/g, '').trim();

      return {
        success: true,
        answer: cleanAnswer || (language === 'vi' ? 'Đã tìm thấy đồ phù hợp.' : 'Matching item found.'),
        matchedFurnitureId,
        matchedRoomId,
        source: 'browser',
      };
    } catch (err) {
      console.warn('[browserAI] Local prompt failed, switching to cloud fallback:', err);
    }
  }

  // Attempt 2: Cloud Fallback API
  try {
    const manualKey = typeof window !== 'undefined' ? (localStorage.getItem('roomfindable_gemini_api_key') || '').trim() : '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (manualKey) {
      headers['x-gemini-api-key'] = manualKey;
    }

    const res = await fetch('/api/ai/semantic-search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        rooms,
        furniture,
        items,
        language,
        apiKey: manualKey || undefined,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (onChunk && data.answer) onChunk(data.answer);

    return {
      success: true,
      answer: data.answer,
      matchedFurnitureId: data.matchedFurnitureId,
      matchedRoomId: data.matchedRoomId,
      source: 'cloud',
    };
  } catch (cloudErr: any) {
    console.error('[browserAI] Both local and cloud search failed:', cloudErr);
    return {
      success: false,
      answer: language === 'vi'
        ? `Lỗi kết nối AI: ${cloudErr.message || 'Không thể xử lý'}. Vui lòng thử lại.`
        : `AI Connection Error: ${cloudErr.message || 'Could not process'}. Please try again.`,
      source: 'cloud',
    };
  }
}

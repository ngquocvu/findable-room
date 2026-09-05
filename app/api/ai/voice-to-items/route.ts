import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/src/lib/geminiClient';
import { resolveFlags } from '@/src/lib/featureFlags';
import type { ItemCategory } from '@/src/types';

const ITEM_CATEGORIES: ItemCategory[] = [
  'clothing', 'documents', 'electronics', 'tools', 'books', 'kitchenware', 'toys', 'misc',
];

interface ParsedItem {
  name: string;
  category: ItemCategory;
  quantity: number;
  tags: string[];
}

interface VoiceToItemsResponse {
  success: boolean;
  detectedIntent: 'add' | 'replace';
  confidence: number;
  items: ParsedItem[];
  explanation?: string;
}

function buildPrompt(transcript: string, furnitureName: string, furnitureType: string, language: string): string {
  return `
You are a smart home inventory assistant. Parse the following voice transcript into a structured list of items to store.

Furniture unit: "${furnitureName}" (type: ${furnitureType})
User transcript: "${transcript}"
Language context: ${language}

Categories available: ${ITEM_CATEGORIES.join(', ')}

Instructions:
1. Parse each distinct item mentioned, even if phrasing is informal or uses local dialect
2. Infer quantities — if none specified, default to 1
3. Assign the most fitting category from the list above
4. Generate 1-3 relevant tags per item (short descriptive keywords)
5. Detect if user wants to "add" items to existing inventory or "replace" all existing items:
   - "replace" signals: "thay thế", "xóa cũ", "replace all", "start fresh", "only keep", "clear and put"
   - Default to "add" if unclear
6. Set confidence 0.0-1.0 based on how clearly items were stated

Response JSON only:
{
  "detectedIntent": "add",
  "confidence": 0.9,
  "items": [
    { "name": "White shirt", "category": "clothing", "quantity": 3, "tags": ["shirt", "white", "cotton"] }
  ],
  "explanation": "Parsed 1 shirt mentioned clearly"
}
`.trim();
}

export async function POST(req: NextRequest) {
  // Feature flag guard
  const flags = resolveFlags();
  if (!flags.aiVoiceToItems && process.env.NEXT_PUBLIC_FF_VOICE_TO_ITEMS === 'false') {
    return NextResponse.json({ error: 'Feature is currently disabled' }, { status: 403 });
  }

  const customApiKey = req.headers.get('x-gemini-api-key')?.trim() || undefined;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const apiKey = customApiKey || body.apiKey?.trim() || undefined;

  // Check if an API key is available
  if (!apiKey && !process.env.GEMINI_API_KEY && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API Key missing. Please provide an API key in AI Labs settings or configure GEMINI_API_KEY.' },
      { status: 401 }
    );
  }

  const { transcript, furnitureName, furnitureType, language } = body;
  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 });
  }

  try {
    const result = await generateStructuredJSON<VoiceToItemsResponse>({
      prompt: buildPrompt(
        transcript,
        furnitureName ?? 'Storage',
        furnitureType ?? 'box',
        language ?? 'en'
      ),
      temperature: 0.2,
      maxOutputTokens: 2048,
      apiKey,
    });

    // Validate and normalize items
    const items: ParsedItem[] = (result.items ?? []).map((item: any) => ({
      name: String(item.name ?? '').trim(),
      category: ITEM_CATEGORIES.includes(item.category) ? item.category : 'misc',
      quantity: Math.max(1, parseInt(item.quantity) || 1),
      tags: Array.isArray(item.tags) ? item.tags.map(String).filter(Boolean) : [],
    })).filter((item) => item.name.length > 0);

    return NextResponse.json({
      success: true,
      detectedIntent: result.detectedIntent === 'replace' ? 'replace' : 'add',
      confidence: Math.min(1, Math.max(0, result.confidence ?? 0.8)),
      items,
      explanation: result.explanation,
    } satisfies VoiceToItemsResponse);
  } catch (err: any) {
    console.error('[api/ai/voice-to-items]', err);
    const msg = err.message || 'AI parsing failed. Please try again.';
    const isAuthError = msg.includes('API_KEY') || msg.includes('401') || msg.includes('403') || msg.includes('API key');
    return NextResponse.json(
      { error: isAuthError ? `API Key Error: ${msg}` : msg },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

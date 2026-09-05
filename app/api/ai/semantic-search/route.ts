import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/src/lib/geminiClient';
import type { Room, Furniture, StoredItem } from '@/src/types';

interface SemanticSearchRequestBody {
  query: string;
  rooms: Room[];
  furniture: Furniture[];
  items: StoredItem[];
  language?: 'vi' | 'en';
}

interface SemanticSearchResponse {
  success: boolean;
  answer: string;
  matchedFurnitureId?: string;
  matchedRoomId?: string;
  matchedItemName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key')?.trim() || undefined;
    const body: SemanticSearchRequestBody & { apiKey?: string } = await req.json();
    const { query, rooms = [], furniture = [], items = [], language = 'vi' } = body;
    const apiKey = customApiKey || body.apiKey?.trim() || undefined;

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Build condensed inventory catalog string
    const inventoryCatalog = furniture.map((f) => {
      const room = rooms.find((r) => r.id === f.roomId);
      const furnItems = items.filter((i) => i.furnitureId === f.id);
      const itemNames = furnItems
        .map((i) => `${i.name} (qty:${i.quantity}, cat:${i.category}, tags:[${i.tags.join(',')}])`)
        .join(', ');
      return `[FurnitureID: "${f.id}", Name: "${f.name}", Room: "${room?.name || 'Unknown'}", RoomID: "${room?.id || ''}"] Items: ${itemNames || 'Empty'}`;
    }).join('\n');

    const prompt = `
You are a smart 3D spatial room inventory locator for the application RoomFindable.
Current Inventory Catalog:
${inventoryCatalog || 'No items registered'}

User question: "${query}"
Language: ${language}

Instructions:
1. Reason carefully which room, furniture unit, and item best fulfills the user's intent.
   Even if the exact term is not used (e.g. "đồ đi mưa" -> áo mưa, ô dù; "sạc điện thoại" -> dây sạc, củ sạc), find the closest logical semantic match.
2. Formulate a friendly, direct 1-2 sentence answer in ${language === 'vi' ? 'Vietnamese' : 'English'}, specifying where the item is stored.
3. If a match is found, return its exact furnitureId, roomId, and matchedItemName.
4. If no relevant item exists anywhere in the catalog, explain politely that the item is not stored in any room, and set furnitureId and roomId to null.

Format your response strictly as JSON:
{
  "answer": "...",
  "matchedFurnitureId": "string or null",
  "matchedRoomId": "string or null",
  "matchedItemName": "string or null"
}
`.trim();

    const result = await generateStructuredJSON<{
      answer: string;
      matchedFurnitureId?: string | null;
      matchedRoomId?: string | null;
      matchedItemName?: string | null;
    }>({
      prompt,
      temperature: 0.2,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      matchedFurnitureId: result.matchedFurnitureId || undefined,
      matchedRoomId: result.matchedRoomId || undefined,
      matchedItemName: result.matchedItemName || undefined,
    });
  } catch (err: any) {
    console.error('[semantic-search route] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process semantic search' },
      { status: 500 }
    );
  }
}

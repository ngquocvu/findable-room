import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/src/lib/geminiClient';
import { resolveFlags } from '@/src/lib/featureFlags';
import type { FurnitureType } from '@/src/types';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';

// Image status types
type ImageStatus =
  | 'success'
  | 'empty_room'
  | 'not_a_room'
  | 'poor_lighting_or_quality'
  | 'too_close'
  | 'partial_furniture';

interface AIRoom {
  name: string;
  width: number;
  depth: number;
  height: number;
  floorColor: string;
  wallColor: string;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface AIFurnitureItem {
  name: string;
  type: FurnitureType;
  dimensions: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}

interface ImageToRoomResponse {
  success: boolean;
  status: ImageStatus;
  message: string;
  room?: AIRoom;
  furniture: AIFurnitureItem[];
}

const VALID_FURNITURE_TYPES: FurnitureType[] = [
  'wardrobe', 'cabinet', 'closet', 'table', 'desk', 'shelf', 'drawer', 'box', 'bed', 'fridge',
];

const GRID_SNAP = 0.25;

function snapToGrid(val: number): number {
  return Math.round(val / GRID_SNAP) * GRID_SNAP;
}

/** Clamp furniture positions inside room bounds so nothing clips through walls */
function sanitizeFurniture(
  items: AIFurnitureItem[],
  room: AIRoom
): AIFurnitureItem[] {
  return items.map((f) => {
    const [fw, fh, fd] = f.dimensions;
    const maxX = room.width / 2 - fw / 2;
    const maxZ = room.depth / 2 - fd / 2;

    return {
      ...f,
      type: VALID_FURNITURE_TYPES.includes(f.type) ? f.type : 'box',
      dimensions: [
        Math.max(0.2, snapToGrid(fw)),
        Math.max(0.2, snapToGrid(fh)),
        Math.max(0.2, snapToGrid(fd)),
      ] as [number, number, number],
      position: [
        snapToGrid(Math.max(-maxX, Math.min(maxX, f.position[0]))),
        snapToGrid(fh / 2), // always rest on floor
        snapToGrid(Math.max(-maxZ, Math.min(maxZ, f.position[2]))),
      ] as [number, number, number],
      rotation: [0, f.rotation[1] ?? 0, 0] as [number, number, number],
    };
  });
}

const IMAGE_PROMPT = `
You are a 3D room layout analyst. Analyze this room photo and extract:
1. Room dimensions (width × depth × height in meters) using physical anchors:
   - Standard door: 2.0-2.1m height, 0.8-0.9m width
   - Standard ceiling: 2.6-3.0m residential
   - Floor tiles: 30cm, 60cm, or 80cm modules
   - Light switches at ~1.2m, outlets at ~0.3m above floor
2. Floor and wall colors as hex codes (sample dominant colors)
3. All visible furniture pieces that match these types: wardrobe, cabinet, closet, table, desk, shelf, drawer, box, bed, fridge
4. Estimated dimensions, position, and rotation for each furniture piece relative to room center (0,0,0)

Positions: X is width axis, Z is depth axis, Y is height axis. Origin (0,0,0) is room center floor.

If no furniture is visible → set status to "empty_room"
If this is not a room photo → set status to "not_a_room"  
If image is blurry or too dark → set status to "poor_lighting_or_quality"
If photo is too zoomed in → set status to "too_close"

Respond with this exact JSON structure:
{
  "status": "success",
  "message": "Brief description",
  "room": {
    "name": "Detected Room",
    "width": 4.5,
    "depth": 3.8,
    "height": 2.8,
    "floorColor": "#c8b99a",
    "wallColor": "#d4cfc7",
    "confidence": "medium",
    "rationale": "Estimated from door frame and tile pattern"
  },
  "furniture": [
    {
      "name": "Wooden Wardrobe",
      "type": "wardrobe",
      "dimensions": [1.2, 2.0, 0.6],
      "position": [-1.5, 1.0, -1.5],
      "rotation": [0, 0, 0],
      "color": "#8B6914"
    }
  ]
}
`.trim();

export async function POST(req: NextRequest) {
  // Feature flag guard
  const flags = resolveFlags();
  if (!flags.aiImageToRoom && process.env.NEXT_PUBLIC_FF_IMAGE_TO_ROOM === 'false') {
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

  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'imageBase64 and mimeType are required' }, { status: 400 });
  }

  try {
    const result = await generateStructuredJSON<ImageToRoomResponse>({
      prompt: IMAGE_PROMPT,
      imageBase64,
      imageMimeType: mimeType,
      temperature: 0.15,
      maxOutputTokens: 4096,
      apiKey,
    });

    // Map success statuses
    if (result.status !== 'success' && result.status !== 'empty_room' && result.status !== 'partial_furniture') {
      return NextResponse.json({
        success: false,
        status: result.status,
        message: result.message,
        furniture: [],
      } satisfies ImageToRoomResponse);
    }

    // Apply defaults for empty room case
    const room: AIRoom = result.room ?? {
      name: 'Scanned Room',
      width: 4.5,
      depth: 3.8,
      height: 2.8,
      floorColor: '#c8b99a',
      wallColor: '#d4cfc7',
      confidence: 'low',
      rationale: 'Defaults applied — no clear room reference found',
    };

    // Sanitize furniture coordinates
    const furniture = sanitizeFurniture(result.furniture ?? [], room);

    return NextResponse.json({
      success: true,
      status: furniture.length === 0 ? 'empty_room' : result.status,
      message: result.message,
      room,
      furniture,
    } satisfies ImageToRoomResponse);
  } catch (err: any) {
    console.error('[api/ai/image-to-room]', err);
    const msg = err.message || 'AI analysis failed. Please try again.';
    const isAuthError = msg.includes('API_KEY') || msg.includes('401') || msg.includes('403') || msg.includes('API key');
    return NextResponse.json(
      { error: isAuthError ? `API Key Error: ${msg}` : msg },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

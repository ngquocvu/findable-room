// =========================================================
// Browser Agent — In-app action copilot with tool-calling.
// Allows natural language commands to modify the room store.
// =========================================================

import type { AppState, Furniture, Room, StoredItem } from '@/src/types';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { v4 as uuidv4 } from 'uuid';

export interface AgentToolResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface AgentAction {
  toolName: string;
  args: Record<string, any>;
  description: string;
}

export interface AgentPlan {
  actions: AgentAction[];
  summary: string;
  requiresConfirmation: boolean;
}

export interface AgentContext {
  rooms: Room[];
  furniture: Furniture[];
  items: StoredItem[];
  activeRoomId: string | null;
  language: 'vi' | 'en';
}

/** Available tool definitions for the agent */
export const AGENT_TOOLS = [
  {
    name: 'create_room',
    description: 'Create a new room with given dimensions and colors',
    parameters: ['name', 'width', 'depth', 'height', 'floorColor', 'wallColor'],
  },
  {
    name: 'place_furniture',
    description: 'Add a furniture item to the active room',
    parameters: ['type', 'name', 'color'],
  },
  {
    name: 'manage_furniture_items',
    description: 'Add or replace items in a furniture unit',
    parameters: ['furnitureName', 'mode', 'items'],
  },
  {
    name: 'find_and_highlight',
    description: 'Search for an item and navigate camera to it',
    parameters: ['query'],
  },
  {
    name: 'trigger_photo_scan',
    description: 'Open the image scan modal for room photo analysis',
    parameters: [],
  },
];

const TOOLS_DESCRIPTION = AGENT_TOOLS.map(
  (t) => `- ${t.name}(${t.parameters.join(', ')}): ${t.description}`
).join('\n');

/**
 * Plan agent actions from a natural language instruction.
 * Uses window.ai (Gemini Nano on-device) if available, otherwise
 * returns a request that the caller should route to the Cloud API.
 */
export async function planAgentActions(
  instruction: string,
  context: AgentContext
): Promise<AgentPlan | 'needs_cloud'> {
  const windowAI = typeof window !== 'undefined' ? (window as any).ai : null;
  if (!windowAI?.languageModel?.create) {
    return 'needs_cloud';
  }

  const roomList = context.rooms.map((r) => `"${r.name}" (id:${r.id})`).join(', ');
  const furnList = context.furniture
    .filter((f) => f.roomId === context.activeRoomId)
    .map((f) => `"${f.name}" type:${f.type} (id:${f.id})`)
    .join(', ');

  const prompt = `
You are an intelligent room planning assistant for RoomFindable, a 3D inventory management app.

Current state:
- Rooms: ${roomList || 'none'}
- Active room furniture: ${furnList || 'none'}
- Active room ID: ${context.activeRoomId ?? 'none'}

Available tools:
${TOOLS_DESCRIPTION}

User instruction: "${instruction}"

Create an action plan as JSON:
{
  "summary": "Human-readable summary of what will be done",
  "requiresConfirmation": true,
  "actions": [
    { "toolName": "tool_name", "args": { ... }, "description": "What this step does" }
  ]
}

Rules:
- Only use tools from the list above
- Infer reasonable defaults for missing parameters
- Always set requiresConfirmation to true for destructive actions (replace, delete)
- Respond with JSON only
`.trim();

  try {
    const session = await windowAI.languageModel.create({ temperature: 0.3 });
    const response = await session.prompt(prompt);
    session.destroy();

    const text = (response ?? '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error('Could not parse agent plan');
    }

    return {
      actions: parsed.actions ?? [],
      summary: parsed.summary ?? instruction,
      requiresConfirmation: parsed.requiresConfirmation ?? true,
    };
  } catch (err) {
    console.warn('[browserAgent] Plan failed, routing to cloud:', err);
    return 'needs_cloud';
  }
}

/**
 * Execute a single agent tool action against the provided store action callbacks.
 */
export async function executeAgentTool(
  action: AgentAction,
  storeActions: {
    addRoom: (room: Room) => void;
    addFurniture: (f: Furniture) => void;
    addItem: (item: StoredItem) => void;
    replaceFurnitureItems: (furnitureId: string, items: StoredItem[]) => void;
    furniture: Furniture[];
    activeRoomId: string | null;
    onFindAndHighlight: (query: string) => void;
    onTriggerPhotoScan: () => void;
    onSetActiveRoom: (id: string) => void;
  }
): Promise<AgentToolResult> {
  const { toolName, args } = action;

  switch (toolName) {
    case 'create_room': {
      const room: Room = {
        id: uuidv4(),
        name: args.name ?? 'New Room',
        width: Number(args.width) || 5,
        depth: Number(args.depth) || 5,
        height: Number(args.height) || 2.8,
        floorColor: args.floorColor ?? '#c8b99a',
        wallColor: args.wallColor ?? '#d4cfc7',
      };
      storeActions.addRoom(room);
      storeActions.onSetActiveRoom(room.id);
      return { success: true, message: `Created room "${room.name}"`, data: room };
    }

    case 'place_furniture': {
      if (!storeActions.activeRoomId) {
        return { success: false, message: 'No active room selected' };
      }
      const type = args.type as string;
      const preset = FURNITURE_PRESETS[type as keyof typeof FURNITURE_PRESETS];
      if (!preset) {
        return { success: false, message: `Unknown furniture type: ${type}` };
      }
      const furn: Furniture = {
        id: uuidv4(),
        roomId: storeActions.activeRoomId,
        name: args.name ?? preset.label,
        type: preset.id,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        dimensions: preset.defaultDimensions,
        color: args.color ?? preset.defaultColor,
      };
      storeActions.addFurniture(furn);
      return { success: true, message: `Added "${furn.name}"`, data: furn };
    }

    case 'manage_furniture_items': {
      const target = storeActions.furniture.find(
        (f) =>
          f.name.toLowerCase().includes(args.furnitureName?.toLowerCase() ?? '') ||
          f.id === args.furnitureName
      );
      if (!target) {
        return { success: false, message: `Furniture "${args.furnitureName}" not found` };
      }
      const items: StoredItem[] = (args.items ?? []).map((i: any) => ({
        id: uuidv4(),
        furnitureId: target.id,
        name: i.name,
        category: i.category ?? 'misc',
        quantity: i.quantity ?? 1,
        tags: i.tags ?? [],
      }));
      if (args.mode === 'replace') {
        storeActions.replaceFurnitureItems(target.id, items);
      } else {
        items.forEach((item) => storeActions.addItem(item));
      }
      return {
        success: true,
        message: `${args.mode === 'replace' ? 'Replaced' : 'Added'} ${items.length} item(s) in "${target.name}"`,
      };
    }

    case 'find_and_highlight': {
      storeActions.onFindAndHighlight(args.query ?? '');
      return { success: true, message: `Searching for "${args.query}"` };
    }

    case 'trigger_photo_scan': {
      storeActions.onTriggerPhotoScan();
      return { success: true, message: 'Opened room photo scan' };
    }

    default:
      return { success: false, message: `Unknown tool: ${toolName}` };
  }
}

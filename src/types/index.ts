export interface Room {
  id: string;
  name: string;
  width: number; // in meters/units
  depth: number;
  height: number;
  floorColor: string;
  wallColor: string;
}

export type FurnitureType = 'wardrobe' | 'shelf' | 'box' | 'desk' | 'bed' | 'other';

export interface Furniture {
  id: string;
  roomId: string;
  name: string;
  type: FurnitureType;
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // x, y, z
  dimensions: [number, number, number]; // width, height, depth
  color: string;
}

export type ItemCategory = 'clothing' | 'documents' | 'electronics' | 'tools' | 'books' | 'misc';

export interface StoredItem {
  id: string;
  furnitureId: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  tags: string[];
}

export interface AppState {
  rooms: Room[];
  furniture: Furniture[];
  items: StoredItem[];
  activeRoomId: string | null;
  activeFurnitureId: string | null;
}

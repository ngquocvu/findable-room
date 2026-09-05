export interface Room {
  id: string;
  name: string;
  width: number; // in meters/units
  depth: number;
  height: number;
  floorColor: string;
  wallColor: string;
}

export type FurnitureType =
  | 'wardrobe'
  | 'cabinet'
  | 'closet'
  | 'table'
  | 'desk'
  | 'shelf'
  | 'drawer'
  | 'box'
  | 'bed'
  | 'fridge';

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

export type ItemCategory = 'clothing' | 'documents' | 'electronics' | 'tools' | 'books' | 'kitchenware' | 'toys' | 'misc';

export type Language = 'vi' | 'en';

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
  language: Language;
}

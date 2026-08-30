// =========================================================
// Furniture Presets — Catalog of furniture types with
// default dimensions, colors, and display info.
// Users never need to manually set W/H/D.
// =========================================================

import { FurnitureType } from '@/src/types';

export interface FurniturePreset {
  id: FurnitureType;
  label: string;
  icon: string;
  /** [width, height, depth] in meters */
  defaultDimensions: [number, number, number];
  /** Default color as hex string */
  defaultColor: string;
  description: string;
}

export const FURNITURE_PRESETS: Record<FurnitureType, FurniturePreset> = {
  wardrobe: {
    id: 'wardrobe',
    label: 'Wardrobe',
    icon: '🗄️',
    defaultDimensions: [1.2, 2.0, 0.6],
    defaultColor: '#8B6914',
    description: 'Tall storage with doors',
  },
  cabinet: {
    id: 'cabinet',
    label: 'Cabinet',
    icon: '🗃️',
    defaultDimensions: [0.8, 1.0, 0.5],
    defaultColor: '#6B4226',
    description: 'Medium storage unit',
  },
  closet: {
    id: 'closet',
    label: 'Closet',
    icon: '🚪',
    defaultDimensions: [1.5, 2.2, 0.7],
    defaultColor: '#9E7B5A',
    description: 'Large walk-in storage',
  },
  table: {
    id: 'table',
    label: 'Table',
    icon: '🪑',
    defaultDimensions: [1.2, 0.75, 0.8],
    defaultColor: '#A0522D',
    description: 'Flat surface with legs',
  },
  desk: {
    id: 'desk',
    label: 'Desk',
    icon: '🖥️',
    defaultDimensions: [1.4, 0.75, 0.7],
    defaultColor: '#5C4033',
    description: 'Work desk with drawers',
  },
  shelf: {
    id: 'shelf',
    label: 'Shelf',
    icon: '📚',
    defaultDimensions: [1.0, 1.8, 0.3],
    defaultColor: '#CD853F',
    description: 'Open multi-tier shelving',
  },
  drawer: {
    id: 'drawer',
    label: 'Drawer',
    icon: '🗂️',
    defaultDimensions: [0.6, 0.8, 0.5],
    defaultColor: '#8B7355',
    description: 'Stacked pull-out drawers',
  },
  box: {
    id: 'box',
    label: 'Box',
    icon: '📦',
    defaultDimensions: [0.5, 0.4, 0.5],
    defaultColor: '#D2691E',
    description: 'Storage container/box',
  },
  bed: {
    id: 'bed',
    label: 'Bed',
    icon: '🛏️',
    defaultDimensions: [1.5, 0.5, 2.0],
    defaultColor: '#6A5ACD',
    description: 'Bed with headboard & frame',
  },
  fridge: {
    id: 'fridge',
    label: 'Fridge',
    icon: '🧊',
    defaultDimensions: [0.7, 1.8, 0.7],
    defaultColor: '#B0C4DE',
    description: 'Refrigerator/freezer',
  },
};

export const FURNITURE_PRESET_LIST = Object.values(FURNITURE_PRESETS);

/** Grid-snap size in meters */
export const GRID_SNAP = 0.25;

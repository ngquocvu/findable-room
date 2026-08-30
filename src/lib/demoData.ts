import { AppState, Room, Furniture, StoredItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function getDemoData(): AppState {
  const roomId = uuidv4();
  const deskId = uuidv4();
  const wardrobeId = uuidv4();
  const shelfId = uuidv4();
  const bedId = uuidv4();
  const cabinetId = uuidv4();
  const boxId = uuidv4();

  const room: Room = {
    id: roomId,
    name: 'Cozy Studio & Study',
    width: 6,
    depth: 6,
    height: 2.8,
    floorColor: '#c2a688',
    wallColor: '#e6e0d4',
  };

  const furniture: Furniture[] = [
    {
      id: deskId,
      roomId: roomId,
      name: 'Work Desk',
      type: 'desk',
      position: [-1.75, 0, -1.75],
      rotation: [0, 0, 0],
      dimensions: [1.4, 0.75, 0.7],
      color: '#5C4033',
    },
    {
      id: wardrobeId,
      roomId: roomId,
      name: 'Main Wardrobe',
      type: 'wardrobe',
      position: [1.8, 0, -2.0],
      rotation: [0, 0, 0],
      dimensions: [1.2, 2.0, 0.6],
      color: '#8B6914',
    },
    {
      id: shelfId,
      roomId: roomId,
      name: 'Bookshelf',
      type: 'shelf',
      position: [-2.2, 0, 1.2],
      rotation: [0, Math.PI / 2, 0],
      dimensions: [1.0, 1.8, 0.3],
      color: '#CD853F',
    },
    {
      id: bedId,
      roomId: roomId,
      name: 'Comfort Bed',
      type: 'bed',
      position: [1.6, 0, 1.4],
      rotation: [0, 0, 0],
      dimensions: [1.5, 0.5, 2.0],
      color: '#6A5ACD',
    },
    {
      id: cabinetId,
      roomId: roomId,
      name: 'Coffee & Snack Cabinet',
      type: 'cabinet',
      position: [-0.2, 0, -2.2],
      rotation: [0, 0, 0],
      dimensions: [0.8, 1.0, 0.5],
      color: '#6B4226',
    },
    {
      id: boxId,
      roomId: roomId,
      name: 'Storage Box',
      type: 'box',
      position: [2.2, 0, -0.6],
      rotation: [0, 0, 0],
      dimensions: [0.5, 0.4, 0.5],
      color: '#D2691E',
    },
  ];

  const items: StoredItem[] = [
    // Desk items
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: 'MacBook Pro 16"',
      category: 'electronics',
      quantity: 1,
      tags: ['apple', 'laptop', 'work', 'computer'],
    },
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: 'USB-C Fast Charger & Cable',
      category: 'electronics',
      quantity: 2,
      tags: ['charger', 'cable', 'power'],
    },
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: 'Sony WH-1000XM5 Headphones',
      category: 'electronics',
      quantity: 1,
      tags: ['audio', 'music', 'headphones', 'sony'],
    },
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: 'Moleskine Journal & Gel Pen',
      category: 'misc',
      quantity: 1,
      tags: ['notebook', 'planner', 'writing', 'pen'],
    },

    // Wardrobe items
    {
      id: uuidv4(),
      furnitureId: wardrobeId,
      name: 'North Face Winter Down Jacket',
      category: 'clothing',
      quantity: 1,
      tags: ['coat', 'jacket', 'winter', 'clothes'],
    },
    {
      id: uuidv4(),
      furnitureId: wardrobeId,
      name: 'White Oxford Cotton Shirts',
      category: 'clothing',
      quantity: 4,
      tags: ['shirt', 'formal', 'work', 'clothes'],
    },
    {
      id: uuidv4(),
      furnitureId: wardrobeId,
      name: 'Merino Wool Warm Blanket',
      category: 'clothing',
      quantity: 1,
      tags: ['blanket', 'wool', 'bedding'],
    },

    // Shelf items
    {
      id: uuidv4(),
      furnitureId: shelfId,
      name: 'Sci-Fi Hardcover Book Set',
      category: 'books',
      quantity: 6,
      tags: ['books', 'reading', 'novel', 'scifi'],
    },
    {
      id: uuidv4(),
      furnitureId: shelfId,
      name: 'Fujifilm X-T5 & 35mm F1.4 Lens',
      category: 'electronics',
      quantity: 1,
      tags: ['camera', 'photo', 'fujifilm', 'gadget'],
    },
    {
      id: uuidv4(),
      furnitureId: shelfId,
      name: 'Passport & Important Document Folder',
      category: 'documents',
      quantity: 1,
      tags: ['passport', 'documents', 'important', 'travel'],
    },

    // Bed items
    {
      id: uuidv4(),
      furnitureId: bedId,
      name: 'Contour Memory Foam Pillow',
      category: 'misc',
      quantity: 2,
      tags: ['pillow', 'sleep', 'comfort'],
    },

    // Cabinet items
    {
      id: uuidv4(),
      furnitureId: cabinetId,
      name: 'Ethiopia Yirgacheffe Coffee Beans',
      category: 'kitchenware',
      quantity: 1,
      tags: ['coffee', 'beans', 'drinks', 'breakfast'],
    },
    {
      id: uuidv4(),
      furnitureId: cabinetId,
      name: 'Comprehensive First Aid Kit',
      category: 'misc',
      quantity: 1,
      tags: ['medicine', 'firstaid', 'health', 'emergency'],
    },

    // Storage Box items
    {
      id: uuidv4(),
      furnitureId: boxId,
      name: 'Catan & Carcassonne Board Games',
      category: 'toys',
      quantity: 2,
      tags: ['games', 'fun', 'entertainment', 'catan'],
    },
    {
      id: uuidv4(),
      furnitureId: boxId,
      name: 'Rechargeable AA & AAA Batteries',
      category: 'tools',
      quantity: 12,
      tags: ['battery', 'power', 'utility', 'rechargeable'],
    },
  ];

  return {
    rooms: [room],
    furniture,
    items,
    activeRoomId: roomId,
    activeFurnitureId: null,
  };
}

import { AppState, Room, Furniture, StoredItem, Language } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function getDemoData(lang: Language = 'vi'): AppState {
  const roomId = uuidv4();
  const deskId = uuidv4();
  const wardrobeId = uuidv4();
  const shelfId = uuidv4();
  const bedId = uuidv4();
  const cabinetId = uuidv4();
  const boxId = uuidv4();

  const isVi = lang === 'vi';

  const room: Room = {
    id: roomId,
    name: isVi ? 'Phòng làm việc & Nghỉ ngơi' : 'Cozy Studio & Study',
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
      name: isVi ? 'Bàn làm việc' : 'Work Desk',
      type: 'desk',
      position: [-1.75, 0, -1.75],
      rotation: [0, 0, 0],
      dimensions: [1.4, 0.75, 0.7],
      color: '#5C4033',
    },
    {
      id: wardrobeId,
      roomId: roomId,
      name: isVi ? 'Tủ quần áo chính' : 'Main Wardrobe',
      type: 'wardrobe',
      position: [1.8, 0, -2.0],
      rotation: [0, 0, 0],
      dimensions: [1.2, 2.0, 0.6],
      color: '#8B6914',
    },
    {
      id: shelfId,
      roomId: roomId,
      name: isVi ? 'Kệ sách' : 'Bookshelf',
      type: 'shelf',
      position: [-2.2, 0, 1.2],
      rotation: [0, Math.PI / 2, 0],
      dimensions: [1.0, 1.8, 0.3],
      color: '#CD853F',
    },
    {
      id: bedId,
      roomId: roomId,
      name: isVi ? 'Giường ngủ' : 'Comfort Bed',
      type: 'bed',
      position: [1.6, 0, 1.4],
      rotation: [0, 0, 0],
      dimensions: [1.5, 0.5, 2.0],
      color: '#6A5ACD',
    },
    {
      id: cabinetId,
      roomId: roomId,
      name: isVi ? 'Tủ cà phê & Đồ uống' : 'Coffee & Snack Cabinet',
      type: 'cabinet',
      position: [-0.2, 0, -2.2],
      rotation: [0, 0, 0],
      dimensions: [0.8, 1.0, 0.5],
      color: '#6B4226',
    },
    {
      id: boxId,
      roomId: roomId,
      name: isVi ? 'Thùng lưu trữ' : 'Storage Box',
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
      tags: isVi ? ['apple', 'laptop', 'công việc', 'máy tính'] : ['apple', 'laptop', 'work', 'computer'],
    },
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: isVi ? 'Củ sạc nhanh USB-C & Dây sạc' : 'USB-C Fast Charger & Cable',
      category: 'electronics',
      quantity: 2,
      tags: isVi ? ['sạc', 'dây cáp', 'nguồn'] : ['charger', 'cable', 'power'],
    },
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: isVi ? 'Tai nghe Sony WH-1000XM5' : 'Sony WH-1000XM5 Headphones',
      category: 'electronics',
      quantity: 1,
      tags: isVi ? ['âm thanh', 'tai nghe', 'nhạc', 'sony'] : ['audio', 'music', 'headphones', 'sony'],
    },
    {
      id: uuidv4(),
      furnitureId: deskId,
      name: isVi ? 'Sổ tay Moleskine & Bút ký' : 'Moleskine Journal & Gel Pen',
      category: 'misc',
      quantity: 1,
      tags: isVi ? ['sổ', 'ghi chép', 'viết', 'bút'] : ['notebook', 'planner', 'writing', 'pen'],
    },

    // Wardrobe items
    {
      id: uuidv4(),
      furnitureId: wardrobeId,
      name: isVi ? 'Áo phao mùa đông The North Face' : 'North Face Winter Down Jacket',
      category: 'clothing',
      quantity: 1,
      tags: isVi ? ['áo khoác', 'mùa đông', 'quần áo'] : ['coat', 'jacket', 'winter', 'clothes'],
    },
    {
      id: uuidv4(),
      furnitureId: wardrobeId,
      name: isVi ? 'Áo sơ mi trắng Oxford' : 'White Oxford Cotton Shirts',
      category: 'clothing',
      quantity: 4,
      tags: isVi ? ['áo sơ mi', 'công sở', 'quần áo'] : ['shirt', 'formal', 'work', 'clothes'],
    },
    {
      id: uuidv4(),
      furnitureId: wardrobeId,
      name: isVi ? 'Chăn len lông cừu Merino ấm áp' : 'Merino Wool Warm Blanket',
      category: 'clothing',
      quantity: 1,
      tags: isVi ? ['chăn', 'len', 'phòng ngủ'] : ['blanket', 'wool', 'bedding'],
    },

    // Shelf items
    {
      id: uuidv4(),
      furnitureId: shelfId,
      name: isVi ? 'Bộ sách tiểu thuyết khoa học viễn tưởng' : 'Sci-Fi Hardcover Book Set',
      category: 'books',
      quantity: 6,
      tags: isVi ? ['sách', 'đọc sách', 'tiểu thuyết'] : ['books', 'reading', 'novel', 'scifi'],
    },
    {
      id: uuidv4(),
      furnitureId: shelfId,
      name: isVi ? 'Máy ảnh Fujifilm X-T5 & Ống kính 35mm F1.4' : 'Fujifilm X-T5 & 35mm F1.4 Lens',
      category: 'electronics',
      quantity: 1,
      tags: isVi ? ['máy ảnh', 'chụp hình', 'fujifilm'] : ['camera', 'photo', 'fujifilm', 'gadget'],
    },
    {
      id: uuidv4(),
      furnitureId: shelfId,
      name: isVi ? 'Hộ chiếu & Túi hồ sơ quan trọng' : 'Passport & Important Document Folder',
      category: 'documents',
      quantity: 1,
      tags: isVi ? ['hộ chiếu', 'giấy tờ', 'quan trọng', 'du lịch'] : ['passport', 'documents', 'important', 'travel'],
    },

    // Bed items
    {
      id: uuidv4(),
      furnitureId: bedId,
      name: isVi ? 'Gối cao su non Memory Foam' : 'Contour Memory Foam Pillow',
      category: 'misc',
      quantity: 2,
      tags: isVi ? ['gối', 'ngủ', 'êm ái'] : ['pillow', 'sleep', 'comfort'],
    },

    // Cabinet items
    {
      id: uuidv4(),
      furnitureId: cabinetId,
      name: isVi ? 'Hạt cà phê Ethiopia Yirgacheffe' : 'Ethiopia Yirgacheffe Coffee Beans',
      category: 'kitchenware',
      quantity: 1,
      tags: isVi ? ['cà phê', 'đồ uống', 'pha chế'] : ['coffee', 'beans', 'drinks', 'breakfast'],
    },
    {
      id: uuidv4(),
      furnitureId: cabinetId,
      name: isVi ? 'Hộp sơ cứu y tế gia đình' : 'Comprehensive First Aid Kit',
      category: 'misc',
      quantity: 1,
      tags: isVi ? ['thuốc', 'y tế', 'sơ cứu', 'khẩn cấp'] : ['medicine', 'firstaid', 'health', 'emergency'],
    },

    // Storage Box items
    {
      id: uuidv4(),
      furnitureId: boxId,
      name: isVi ? 'Bộ trò chơi boardgame Catan & Carcassonne' : 'Catan & Carcassonne Board Games',
      category: 'toys',
      quantity: 2,
      tags: isVi ? ['trò chơi', 'giải trí', 'boardgame'] : ['games', 'fun', 'entertainment', 'catan'],
    },
    {
      id: uuidv4(),
      furnitureId: boxId,
      name: isVi ? 'Hộp pin sạc AA & AAA' : 'Rechargeable AA & AAA Batteries',
      category: 'tools',
      quantity: 12,
      tags: isVi ? ['pin', 'tiện ích', 'sạc lại'] : ['battery', 'power', 'utility', 'rechargeable'],
    },
  ];

  return {
    rooms: [room],
    furniture,
    items,
    activeRoomId: roomId,
    activeFurnitureId: null,
    language: lang,
  };
}

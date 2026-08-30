import { create } from 'zustand';
import { Room, Furniture, StoredItem, AppState } from '../types';

interface StoreActions {
  addRoom: (room: Room) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addFurniture: (furniture: Furniture) => void;
  updateFurniture: (id: string, furniture: Partial<Furniture>) => void;
  deleteFurniture: (id: string) => void;
  addItem: (item: StoredItem) => void;
  updateItem: (id: string, item: Partial<StoredItem>) => void;
  deleteItem: (id: string) => void;
  setActiveRoom: (id: string | null) => void;
  setActiveFurniture: (id: string | null) => void;
  importData: (data: AppState) => void;
}

type Store = AppState & StoreActions;

export const useStore = create<Store>((set) => ({
  rooms: [],
  furniture: [],
  items: [],
  activeRoomId: null,
  activeFurnitureId: null,

  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room], activeRoomId: room.id })),
  updateRoom: (id, updatedRoom) => set((state) => ({
    rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updatedRoom } : r)),
  })),
  deleteRoom: (id) => set((state) => ({
    rooms: state.rooms.filter((r) => r.id !== id),
    furniture: state.furniture.filter((f) => f.roomId !== id),
    items: state.items.filter((i) => {
      const parentFurniture = state.furniture.find((f) => f.id === i.furnitureId);
      return parentFurniture?.roomId !== id;
    }),
    activeRoomId: state.activeRoomId === id ? null : state.activeRoomId,
    activeFurnitureId: null,
  })),

  addFurniture: (furniture) => set((state) => ({ furniture: [...state.furniture, furniture] })),
  updateFurniture: (id, updatedFurniture) => set((state) => ({
    furniture: state.furniture.map((f) => (f.id === id ? { ...f, ...updatedFurniture } : f)),
  })),
  deleteFurniture: (id) => set((state) => ({
    furniture: state.furniture.filter((f) => f.id !== id),
    items: state.items.filter((i) => i.furnitureId !== id),
    activeFurnitureId: state.activeFurnitureId === id ? null : state.activeFurnitureId,
  })),

  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updatedItem) => set((state) => ({
    items: state.items.map((i) => (i.id === id ? { ...i, ...updatedItem } : i)),
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),

  setActiveRoom: (id) => set({ activeRoomId: id, activeFurnitureId: null }),
  setActiveFurniture: (id) => set({ activeFurnitureId: id }),

  importData: (data) => set({ ...data }),
}));

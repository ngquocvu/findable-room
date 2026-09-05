"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { X, Plus, Trash2, Tag, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { ItemCategory } from '@/src/types';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';

const CATEGORY_ICONS: Record<ItemCategory, string> = {
  clothing: '👕',
  documents: '📄',
  electronics: '🔌',
  tools: '🔧',
  books: '📚',
  kitchenware: '🍳',
  toys: '🎮',
  misc: '📦',
};

export function FurnitureContentsModal() {
  // Fix: store the target furniture id directly from the event
  // instead of relying on activeFurnitureId state (race condition)
  const [openFurnitureId, setOpenFurnitureId] = useState<string | null>(null);
  const { setActiveFurniture, furniture, items, addItem, deleteItem } = useStore();

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('misc');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemTags, setNewItemTags] = useState('');

  const activeFurn = furniture.find(f => f.id === openFurnitureId);
  const furnItems = items.filter(i => i.furnitureId === openFurnitureId);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id) {
        setActiveFurniture(id);
        setOpenFurnitureId(id);
      }
    };
    window.addEventListener('open-furniture', handleOpen);
    return () => window.removeEventListener('open-furniture', handleOpen);
  }, [setActiveFurniture]);

  const handleClose = () => setOpenFurnitureId(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !openFurnitureId) return;
    addItem({
      id: uuidv4(),
      furnitureId: openFurnitureId,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity,
      tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemTags('');
  };

  const preset = activeFurn ? FURNITURE_PRESETS[activeFurn.type] : null;

  return (
    <AnimatePresence>
      {openFurnitureId && activeFurn && (
        <div className="fixed inset-y-0 right-0 z-40 flex items-start justify-end p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 340 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 340 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="w-96 bg-[#fdfcf9]/97 backdrop-blur-md border border-[#e5e1d8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#e5e1d8] bg-white/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1eee6] border border-[#e5e1d8] rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  {preset?.icon ?? '📦'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#4a4a38]" style={{ fontFamily: 'Georgia, serif' }}>
                    {activeFurn.name}
                  </h3>
                  <p className="text-xs text-[#a39f90] capitalize">{activeFurn.type} · {furnItems.length} items</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-qr-label', { detail: activeFurn.id }))}
                  title="Print QR Sticker"
                  className="text-[#7a8c4b] hover:text-[#5f6f36] bg-[#f2f6ee] hover:bg-[#eaf1e4] border border-[#d6d1c2] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold shadow-2xs"
                >
                  <QrCode size={14} />
                  <span>QR Sticker</span>
                </button>
                <button onClick={handleClose} className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {furnItems.length === 0 ? (
                <div className="text-center p-8 text-[#a39f90] text-sm">
                  Empty — add items below
                </div>
              ) : (
                furnItems.map(item => (
                  <div key={item.id} className="p-3 bg-white border border-[#e5e1d8] hover:border-[#8a9a5b] rounded-xl flex items-center justify-between group transition-all shadow-sm">
                    <div>
                      <div className="text-[#4a4a38] text-sm font-semibold flex items-center gap-2">
                        <span>{CATEGORY_ICONS[item.category]}</span>
                        {item.name}
                        {item.quantity > 1 && <span className="text-[#8a9a5b] font-bold">×{item.quantity}</span>}
                      </div>
                      <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-1 flex-wrap">
                        <Tag size={9} /> {item.category}
                        {item.tags.length > 0 && <span className="ml-1 text-[#8a8678]">· {item.tags.join(', ')}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-[#c0bdb4] hover:text-red-400 p-1.5 opacity-0 group-hover:opacity-100 transition-all bg-[#f1eee6] hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add item form */}
            <div className="p-4 border-t border-[#e5e1d8] bg-[#f9f7f2]">
              <form onSubmit={handleAddItem} className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item name..."
                    className="flex-1 bg-white border border-[#d6d1c2] rounded-lg px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] placeholder-[#a39f90] shadow-sm"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-14 bg-white border border-[#d6d1c2] rounded-lg px-2 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemTags}
                    onChange={(e) => setNewItemTags(e.target.value)}
                    placeholder="Tags (comma separated)..."
                    className="flex-1 bg-white border border-[#d6d1c2] rounded-lg px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] placeholder-[#a39f90] shadow-sm"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                    className="bg-white border border-[#d6d1c2] rounded-lg px-2 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm"
                  >
                    <option value="misc">📦 Misc</option>
                    <option value="clothing">👕 Clothing</option>
                    <option value="documents">📄 Docs</option>
                    <option value="electronics">🔌 Tech</option>
                    <option value="tools">🔧 Tools</option>
                    <option value="books">📚 Books</option>
                    <option value="kitchenware">🍳 Kitchen</option>
                    <option value="toys">🎮 Toys</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="w-full bg-[#8a9a5b] hover:bg-[#7a8a4b] disabled:opacity-40 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-1 shadow-sm"
                >
                  <Plus size={14} /> Add Item
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

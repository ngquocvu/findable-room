"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { X, Plus, Trash2, Tag, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { ItemCategory } from '@/src/types';

export function FurnitureContentsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFurnitureId, setActiveFurniture, furniture, items, addItem, deleteItem } = useStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('misc');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemTags, setNewItemTags] = useState('');
  
  const activeFurn = furniture.find(f => f.id === activeFurnitureId);
  const furnItems = items.filter(i => i.furnitureId === activeFurnitureId);

  useEffect(() => {
    const handleOpen = (e: Event) => { 
      const customEvent = e as CustomEvent;
      if (customEvent.detail === activeFurnitureId) {
        setIsOpen(true);
      }
    };
    window.addEventListener('open-furniture', handleOpen);
    return () => window.removeEventListener('open-furniture', handleOpen);
  }, [activeFurnitureId]);

  // Open if activeFurnitureId is set? No, activeFurnitureId just means selected. Double click to open?
  // Let's add a custom event `open-furniture` that takes furnitureId.
  // Actually, wait, maybe clicking it in 3D selects it (sets activeFurnitureId), and double clicking opens it?
  
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeFurnitureId) return;
    
    addItem({
      id: uuidv4(),
      furnitureId: activeFurnitureId,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity,
      tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemTags('');
  };

  return (
    <AnimatePresence>
      {isOpen && activeFurn && (
        <div className="fixed inset-y-0 right-0 z-40 flex items-start justify-end p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="w-96 bg-[#fdfcf9]/95 backdrop-blur-md border border-[#e5e1d8] rounded-2xl shadow-xl overflow-hidden flex flex-col h-full pointer-events-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#e5e1d8] bg-[#f9f7f2]/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#8a9a5b] rounded-lg flex items-center justify-center shadow-sm">
                  <Box className="text-white" size={16} />
                </div>
                <h3 className="text-xl font-bold text-[#2c2c2c]" style={{ fontFamily: 'Georgia, serif' }}>{activeFurn.name} Contents</h3>
              </div>
              <button onClick={handleClose} className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {furnItems.length === 0 ? (
                <div className="text-center p-8 text-[#a39f90] font-medium text-sm">
                  This furniture is empty. Add some items below.
                </div>
              ) : (
                furnItems.map(item => (
                  <div key={item.id} className="p-3 bg-white border border-[#e5e1d8] hover:border-[#8a9a5b] rounded-xl shadow-sm flex items-center justify-between group transition-all">
                    <div>
                      <div className="text-[#4a4a38] text-sm font-bold">
                        {item.name} {item.quantity > 1 && <span className="text-[#8a9a5b]">x{item.quantity}</span>}
                      </div>
                      <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-1 flex-wrap">
                        <Tag size={10} /> {item.category}
                        {item.tags.length > 0 && <span className="ml-1 text-[#8a8678] font-bold">• {item.tags.join(', ')}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="text-[#a39f90] hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#f1eee6] rounded-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-[#e5e1d8] bg-[#f9f7f2]">
              <form onSubmit={handleAddItem} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item name..."
                    className="flex-1 bg-white border border-[#d6d1c2] rounded-lg px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm"
                  />
                  <input 
                    type="number" 
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 bg-white border border-[#d6d1c2] rounded-lg px-2 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newItemTags}
                    onChange={(e) => setNewItemTags(e.target.value)}
                    placeholder="Tags (comma separated)..."
                    className="flex-1 bg-white border border-[#d6d1c2] rounded-lg px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm"
                  />
                  <select 
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                    className="bg-white border border-[#d6d1c2] rounded-lg px-2 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm"
                  >
                    <option value="misc">Misc</option>
                    <option value="clothing">Clothing</option>
                    <option value="documents">Docs</option>
                    <option value="electronics">Tech</option>
                    <option value="tools">Tools</option>
                    <option value="books">Books</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="w-full bg-[#8a9a5b] hover:bg-[#7a8a4b] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-2 border-b-2 border-[#5a6b3d] shadow-sm"
                >
                  <Plus size={16} /> Add Item
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { items, furniture, rooms, setActiveRoom, setActiveFurniture } = useStore();

  useEffect(() => {
    const handleOpen = () => { 
      setIsOpen(true); 
      setQuery('');
      setTimeout(() => document.getElementById('search-input')?.focus(), 50); 
    };
    window.addEventListener('open-search', handleOpen as EventListener);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('open-search', handleOpen as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const results = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  ).map(item => {
    const f = furniture.find(f => f.id === item.furnitureId);
    const r = f ? rooms.find(r => r.id === f.roomId) : null;
    return { item, furniture: f, room: r };
  });

  const navigateToItem = (roomId?: string, furnitureId?: string) => {
    if (roomId) setActiveRoom(roomId);
    if (furnitureId) setActiveFurniture(furnitureId);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-[#4a4a38]/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-[#fdfcf9] border border-[#e5e1d8] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center p-4 border-b border-[#e5e1d8] gap-3 bg-white">
              <Search className="text-[#a39f90]" />
              <input 
                id="search-input"
                type="text" 
                placeholder="Search items, tags, or categories..." 
                className="flex-1 bg-transparent border-none outline-none text-lg text-[#4a4a38] placeholder-[#a39f90]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 bg-[#fdfcf9]">
              {query.length === 0 ? (
                <div className="p-8 text-center text-[#8a8678] font-medium">
                  Type to start searching...
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-[#8a8678] font-medium">
                  No items found.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((res, i) => (
                    <div 
                      key={res.item.id} 
                      className="p-3 rounded-lg bg-white border border-[#e5e1d8] hover:border-[#8a9a5b] hover:bg-[#fdfcf9] shadow-sm cursor-pointer flex justify-between items-center group transition-all"
                      onClick={() => navigateToItem(res.room?.id, res.furniture?.id)}
                    >
                      <div>
                        <div className="font-bold text-[#4a4a38]">{res.item.name}</div>
                        <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#f1eee6] rounded border border-[#d6d1c2] text-[#8a8678] font-bold">{res.item.category}</span>
                          {res.item.tags.length > 0 && <span>• {res.item.tags.join(', ')}</span>}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[#a39f90] flex items-center gap-1 group-hover:text-[#8a9a5b] transition-colors">
                        <MapPin size={14} />
                        {res.room?.name} &gt; {res.furniture?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '@/src/lib/translations';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { items, furniture, rooms, setActiveRoom, setActiveFurniture, language } = useStore();
  const t = getTranslation(language);

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
    if (furnitureId) {
      setActiveFurniture(furnitureId);
      window.dispatchEvent(new CustomEvent('open-furniture', { detail: furnitureId }));
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.common.search}
          className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[10vh] bg-[#4a4a38]/30 backdrop-blur-sm p-3 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[80vh]"
          >
            <div className="flex items-center p-3.5 sm:p-4 border-b border-[#e5e1d8] gap-3 bg-white">
              <Search className="text-[#a39f90] shrink-0" size={18} aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                placeholder={t.searchModal.searchInputPlaceholder}
                aria-label={t.searchModal.searchInputPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[#4a4a38] placeholder-[#a39f90]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label={t.searchModal.clearBtn}
                  className="text-xs text-[#a39f90] hover:text-[#4a4a38] px-1.5 py-0.5 rounded"
                >
                  {t.searchModal.clearBtn}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t.common.close}
                className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 rounded-lg transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 bg-white">
              {query.length === 0 ? (
                <div className="p-8 text-center text-[#a39f90] text-sm">
                  {t.searchModal.typeToSearch}
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-[#a39f90] text-sm">
                  {t.searchModal.noResults}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((res) => (
                    <div
                      key={res.item.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${res.item.name}, ${res.room?.name || ''} ${res.furniture?.name || ''}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateToItem(res.room?.id, res.furniture?.id);
                        }
                      }}
                      className="p-3 rounded-xl bg-[#fdfcf9] border border-[#e5e1d8] hover:border-[#8a9a5b] cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 group transition-all shadow-sm"
                      onClick={() => navigateToItem(res.room?.id, res.furniture?.id)}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#4a4a38] text-sm truncate">{res.item.name}</div>
                        <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-[#f1eee6] rounded-full border border-[#d6d1c2] text-[#8a8678] font-semibold">
                            {t.categories[res.item.category] || res.item.category}
                          </span>
                          {res.item.tags.length > 0 && <span className="truncate">· {res.item.tags.join(', ')}</span>}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-[#a39f90] flex items-center gap-1 group-hover:text-[#8a9a5b] transition-colors shrink-0">
                        <MapPin size={12} aria-hidden="true" />
                        <span>{res.room?.name} › {res.furniture?.name}</span>
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

"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { X, Plus, Trash2, Tag, QrCode, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { ItemCategory } from '@/src/types';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { getTranslation } from '@/src/lib/translations';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';

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
  const { setActiveFurniture, furniture, items, addItem, deleteItem, language } = useStore();
  const t = getTranslation(language);
  const { isEnabled } = useFeatureFlags();

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-furniture', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="furniture-contents-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop for both mobile and desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="w-full sm:max-w-lg bg-[#fdfcf9] border-t sm:border border-[#e5e1d8] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh] z-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile pull indicator */}
            <div className="sm:hidden w-10 h-1 bg-[#d6d1c2] rounded-full mx-auto mt-2.5 mb-1 shrink-0" aria-hidden="true" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#e5e1d8] bg-white/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#f1eee6] border border-[#e5e1d8] rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0" aria-hidden="true">
                  {preset?.icon ?? '📦'}
                </div>
                <div className="min-w-0">
                  <h2 id="furniture-contents-title" className="text-base font-bold text-[#4a4a38] truncate" style={{ fontFamily: 'Georgia, serif' }}>
                    {activeFurn.name}
                  </h2>
                  <p className="text-xs text-[#a39f90] capitalize truncate">
                    {t.furniturePresets[activeFurn.type]?.label ?? activeFurn.type} · {furnItems.length} {t.common.items.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-qr-label', { detail: activeFurn.id }))}
                  title={t.contentsModal.qrSticker}
                  aria-label={t.contentsModal.qrSticker}
                  className="text-[#7a8c4b] hover:text-[#5f6f36] bg-[#f2f6ee] hover:bg-[#eaf1e4] border border-[#d6d1c2] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold shadow-2xs"
                >
                  <QrCode size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">{t.contentsModal.qrSticker}</span>
                </button>
                {isEnabled('aiVoiceToItems') && openFurnitureId && (
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-voice-items', { detail: openFurnitureId }))}
                    title={t.voiceItems.buttonLabel}
                    aria-label={t.voiceItems.buttonLabel}
                    className="text-[#6f7e45] hover:text-[#5c693a] bg-white hover:bg-[#f1eee6] border border-[#d6d1c2] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Mic size={14} aria-hidden="true" className="text-[#8a9a5b]" />
                    <span className="hidden sm:inline">AI</span>
                  </button>
                )}
                <button
                  onClick={handleClose}
                  aria-label={t.common.close}
                  className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 rounded-lg transition-colors"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {furnItems.length === 0 ? (
                  <div className="text-center p-8 text-[#a39f90] text-sm">
                    {t.contentsModal.emptyContents}
                  </div>
                ) : (
                  furnItems.map(item => (
                    <div key={item.id} className="p-3 bg-white border border-[#e5e1d8] hover:border-[#8a9a5b] rounded-xl flex items-center justify-between group transition-all shadow-sm">
                      <div>
                        <div className="text-[#4a4a38] text-sm font-semibold flex items-center gap-2">
                          <span aria-hidden="true">{CATEGORY_ICONS[item.category]}</span>
                          {item.name}
                          {item.quantity > 1 && <span className="text-[#8a9a5b] font-bold">×{item.quantity}</span>}
                        </div>
                        <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-1 flex-wrap">
                          <Tag size={9} aria-hidden="true" /> {t.categories[item.category] || item.category}
                          {item.tags.length > 0 && <span className="ml-1 text-[#8a8678]">· {item.tags.join(', ')}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-[#c0bdb4] hover:text-red-400 p-1.5 md:opacity-0 group-hover:opacity-100 transition-all bg-[#f1eee6] hover:bg-red-50 rounded-lg"
                        title={t.common.delete}
                        aria-label={`${t.common.delete} ${item.name}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add item form */}
              <div className="p-4 border-t border-[#e5e1d8] bg-[#f9f7f2] pb-6 md:pb-4">
                <form onSubmit={handleAddItem} className="flex flex-col gap-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={t.contentsModal.itemNamePlaceholder}
                      aria-label={t.contentsModal.itemNamePlaceholder}
                      className="flex-1 min-w-0 bg-white border border-[#d6d1c2] rounded-lg px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] placeholder-[#a39f90] shadow-sm"
                    />
                    <div className="flex items-center gap-1 bg-white border border-[#d6d1c2] rounded-lg px-2 py-1 shadow-sm shrink-0">
                      <span className="text-[10px] font-bold text-[#8a8678] uppercase">{t.contentsModal.qtyShort || 'SL'}:</span>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        aria-label="Số lượng (Quantity)"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                        className="w-10 bg-transparent text-sm font-semibold text-[#4a4a38] text-center focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemTags}
                      onChange={(e) => setNewItemTags(e.target.value)}
                      placeholder={t.contentsModal.tagsPlaceholder}
                      aria-label={t.contentsModal.tagsPlaceholder}
                      className="flex-1 min-w-0 bg-white border border-[#d6d1c2] rounded-lg px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] placeholder-[#a39f90] shadow-sm"
                    />
                    <select
                      value={newItemCategory}
                      aria-label="Danh mục (Category)"
                      onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                      className="w-36 sm:w-44 bg-white border border-[#d6d1c2] rounded-lg px-2 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#8a9a5b] shadow-sm shrink-0 truncate"
                    >
                      {(Object.keys(t.categories) as ItemCategory[]).map(cat => (
                        <option key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {t.categories[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!newItemName.trim()}
                    aria-label={t.contentsModal.addItem}
                    className="w-full bg-[#8a9a5b] hover:bg-[#7a8a4b] disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-1 shadow-sm"
                  >
                    <Plus size={14} aria-hidden="true" /> {t.contentsModal.addItem}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
      )}
    </AnimatePresence>
  );
}

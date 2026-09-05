"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/src/store/useStore';
import { ContainerSnapshot, parseContainerDeepLink } from '@/src/lib/qrCode';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { FurnitureType, ItemCategory, StoredItem } from '@/src/types';
import { X, Search, MapPin, Eye, Download, Check, Plus, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { getTranslation } from '@/src/lib/translations';

const CATEGORY_ICONS: Record<string, string> = {
  clothing: '👕',
  documents: '📄',
  electronics: '🔌',
  tools: '🔧',
  books: '📚',
  kitchenware: '🍳',
  toys: '🎮',
  misc: '📦',
};

export function MobileScanViewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<ContainerSnapshot | null>(null);
  const [localFurnitureId, setLocalFurnitureId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [imported, setImported] = useState(false);

  const {
    rooms,
    furniture,
    items,
    setActiveRoom,
    setActiveFurniture,
    addRoom,
    addFurniture,
    addItem,
    language,
  } = useStore();
  const t = getTranslation(language);

  useEffect(() => {
    const deepLinkInfo = parseContainerDeepLink();
    if (!deepLinkInfo) return;

    const { furnitureId, roomId, snapshot: urlSnapshot } = deepLinkInfo;

    // Check if the item exists in local database
    const existingFurn = furniture.find((f) => f.id === furnitureId);
    const existingRoom = existingFurn
      ? rooms.find((r) => r.id === existingFurn.roomId)
      : roomId
      ? rooms.find((r) => r.id === roomId)
      : null;

    if (existingFurn && existingRoom) {
      // Local container found: select room & open furniture
      setActiveRoom(existingRoom.id);
      setActiveFurniture(existingFurn.id);
      window.dispatchEvent(new CustomEvent('open-furniture', { detail: existingFurn.id }));
      setLocalFurnitureId(existingFurn.id);
    } else if (urlSnapshot) {
      // Standalone phone scan or unfamiliar device: show snapshot card
      setSnapshot(urlSnapshot);
      setIsOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [furniture, rooms, setActiveRoom, setActiveFurniture]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove hash/search params from URL to prevent reopening on re-renders
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleViewIn3D = () => {
    if (!snapshot) return;
    const existingFurn = furniture.find((f) => f.id === snapshot.furnitureId);
    if (existingFurn) {
      setActiveRoom(existingFurn.roomId);
      setActiveFurniture(existingFurn.id);
      window.dispatchEvent(new CustomEvent('open-furniture', { detail: existingFurn.id }));
      handleClose();
    } else {
      // Import into local storage first, then view
      handleImportSnapshot();
      handleClose();
    }
  };

  const handleImportSnapshot = () => {
    if (!snapshot) return;

    // Check if room exists
    let targetRoom = rooms.find((r) => r.id === snapshot.roomId);
    if (!targetRoom) {
      targetRoom = {
        id: snapshot.roomId || uuidv4(),
        name: snapshot.roomName || (language === 'vi' ? 'Phòng quét' : 'Scanned Room'),
        width: 5,
        depth: 5,
        height: 2.8,
        floorColor: '#c8b99a',
        wallColor: '#d4cfc7',
      };
      addRoom(targetRoom);
    }

    // Add furniture
    const preset = FURNITURE_PRESETS[snapshot.furnitureType as FurnitureType] || FURNITURE_PRESETS.box;
    const newFurn = {
      id: snapshot.furnitureId || uuidv4(),
      roomId: targetRoom.id,
      name: snapshot.furnitureName,
      type: (snapshot.furnitureType as FurnitureType) || 'box',
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      dimensions: preset.defaultDimensions,
      color: preset.defaultColor,
    };
    addFurniture(newFurn);

    // Add items
    snapshot.items.forEach((item) => {
      addItem({
        id: item.id || uuidv4(),
        furnitureId: newFurn.id,
        name: item.name,
        category: (item.category as ItemCategory) || 'misc',
        quantity: item.quantity || 1,
        tags: item.tags || [],
      });
    });

    setActiveRoom(targetRoom.id);
    setActiveFurniture(newFurn.id);
    setImported(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-furniture', { detail: newFurn.id }));
    }, 300);
  };

  if (!isOpen || !snapshot) return null;

  const preset = FURNITURE_PRESETS[snapshot.furnitureType as FurnitureType];
  const filteredItems = snapshot.items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4a4a38]/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-md bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#e5e1d8] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f2f6ee] text-[#7a8c4b] border border-[#d6d1c2] rounded-xl flex items-center justify-center text-2xl shadow-xs" aria-hidden="true">
                {preset?.icon ?? '📦'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8a9a5b] uppercase tracking-wider">
                  {t.mobileScanModal.scannedBoxBadge}
                </span>
                <h2 id="scan-modal-title" className="text-lg font-bold text-[#323223] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {snapshot.furnitureName}
                </h2>
                <div className="text-xs text-[#8a8678] flex items-center gap-1 mt-0.5">
                  <MapPin size={12} aria-hidden="true" /> {snapshot.roomName} · {snapshot.items.length} {t.common.items.toLowerCase()}
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              aria-label={t.common.close}
              className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-2 rounded-xl transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Search inside box */}
          <div className="p-3 border-b border-[#e5e1d8] bg-[#f9f7f2] flex items-center gap-2">
            <Search size={14} className="text-[#a39f90] ml-1" aria-hidden="true" />
            <input
              type="text"
              placeholder={t.mobileScanModal.searchInBox}
              aria-label={t.mobileScanModal.searchInBox}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#4a4a38] placeholder-[#a39f90] outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label={t.searchModal.clearBtn}
                className="text-[#a39f90] hover:text-[#4a4a38]"
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[#fdfcf9]">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8a8678]">
                {query ? t.mobileScanModal.noMatchingScanned : t.mobileScanModal.emptyScanned}
              </div>
            ) : (
              filteredItems.map((item, i) => (
                <div
                  key={i}
                  className="p-3 bg-white border border-[#e5e1d8] rounded-xl flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#4a4a38] flex items-center gap-2">
                      <span aria-hidden="true">{CATEGORY_ICONS[item.category] || '📦'}</span>
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="text-[#8a9a5b] text-xs font-bold">×{item.quantity}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-1.5 flex-wrap">
                      <Tag size={9} aria-hidden="true" /> {t.categories[item.category as ItemCategory] || item.category}
                      {item.tags && item.tags.length > 0 && (
                        <span className="text-[#8a8678]">· {item.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-[#e5e1d8] flex flex-col gap-2">
            <button
              onClick={handleViewIn3D}
              aria-label={t.mobileScanModal.openIn3D}
              className="w-full py-2.5 px-4 bg-[#8a9a5b] hover:bg-[#7a8a4b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Eye size={14} aria-hidden="true" /> {t.mobileScanModal.openIn3D}
            </button>

            {!imported && (
              <button
                onClick={handleImportSnapshot}
                aria-label={t.mobileScanModal.saveContainer}
                className="w-full py-2 px-4 bg-[#f5f3ee] hover:bg-[#ede9df] text-[#4a4a38] border border-[#d6d1c2] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={13} aria-hidden="true" /> {t.mobileScanModal.saveContainer}
              </button>
            )}

            {imported && (
              <div className="text-center text-[11px] text-[#5e6c38] font-semibold flex items-center justify-center gap-1">
                <Check size={13} aria-hidden="true" /> {t.mobileScanModal.savedSuccess}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

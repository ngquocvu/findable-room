"use client";

import { useStore } from '@/src/store/useStore';
import { Plus, Trash2, Settings2, FolderDown, FolderUp, ChevronDown, ChevronRight, Sparkles, QrCode, X, Camera, Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState, useRef, useEffect } from 'react';
import { FURNITURE_PRESET_LIST, FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { getDemoData } from '@/src/lib/demoData';
import { FurnitureType } from '@/src/types';
import { getTranslation } from '@/src/lib/translations';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';
import { FurnitureIcon } from '@/src/components/FurnitureIcon';
import { Logo } from '@/src/components/Logo';

export function Sidebar() {
  const store = useStore();
  const {
    rooms, activeRoomId, setActiveRoom, addRoom, deleteRoom, updateRoom,
    furniture, addFurniture, setActiveFurniture, activeFurnitureId, deleteFurniture,
    updateFurniture, importData, addDemoRoom, items, language
  } = store;

  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'rooms' | 'furniture'>('rooms');
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isEnabled } = useFeatureFlags();

  useEffect(() => {
    const handleOpenMobile = () => setMobileOpen(true);
    const handleCloseMobile = () => setMobileOpen(false);

    window.addEventListener('open-mobile-sidebar', handleOpenMobile);
    window.addEventListener('close-mobile-sidebar', handleCloseMobile);

    return () => {
      window.removeEventListener('open-mobile-sidebar', handleOpenMobile);
      window.removeEventListener('close-mobile-sidebar', handleCloseMobile);
    };
  }, []);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeRoomFurniture = furniture.filter(f => f.roomId === activeRoomId);
  const activeFurn = furniture.find(f => f.id === activeFurnitureId);

  const handleAddRoom = () => {
    const newRoom = {
      id: uuidv4(),
      name: `${t.common.rooms} ${rooms.length + 1}`,
      width: 5,
      depth: 5,
      height: 3,
      floorColor: '#c8b99a',
      wallColor: '#d4cfc7',
    };
    addRoom(newRoom);
  };

  const handleAddFurnitureType = (type: FurnitureType) => {
    if (!activeRoomId) return;
    const preset = FURNITURE_PRESETS[type];
    const newFurniture = {
      id: uuidv4(),
      roomId: activeRoomId,
      name: t.furniturePresets[type].label,
      type,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      dimensions: preset.defaultDimensions,
      color: preset.defaultColor,
    };
    addFurniture(newFurniture);
    setActiveTab('furniture');
    setActiveFurniture(newFurniture.id);
  };

  const handleExport = () => {
    const state = useStore.getState();
    const data = {
      rooms: state.rooms,
      furniture: state.furniture,
      items: state.items,
      activeRoomId: null,
      activeFurnitureId: null
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roomfindable-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.rooms && data.furniture && data.items) {
          importData(data);
        } else {
          alert(t.sidebar.invalidBackup);
        }
      } catch {
        alert(t.sidebar.parseFailed);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFurnitureItemCount = (furnitureId: string) =>
    items.filter(i => i.furnitureId === furnitureId).length;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        role="complementary"
        aria-label={t.sidebar.yourRooms}
        className={`fixed inset-y-0 left-0 z-40 w-80 lg:w-84 xl:w-88 max-w-[85vw] bg-[#f9f7f2] border-r border-[#e5e1d8] flex flex-col h-full overflow-hidden text-[#4a4a38] transition-transform duration-300 ease-in-out md:static md:translate-x-0 shrink-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo & Mobile Close */}
        <div className="p-4 sm:p-5 border-b border-[#e5e1d8] flex items-center justify-between">
          <Logo variant="full" size="md" />
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-[#a39f90] hover:text-[#4a4a38] p-1.5 rounded-lg hover:bg-[#f1eee6] transition-colors"
            title={language === 'vi' ? 'Đóng menu' : 'Close menu'}
            aria-label={language === 'vi' ? 'Đóng menu' : 'Close menu'}
          >
            <X size={18} />
          </button>
        </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Sidebar Sections" className="flex border-b border-[#e5e1d8] text-sm shrink-0">
        {(['rooms', 'furniture'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`flex-1 p-3 text-center transition-colors font-medium capitalize ${activeTab === tab ? 'border-b-2 border-[#8a9a5b] text-[#4a4a38]' : 'text-[#a39f90] hover:text-[#4a4a38]'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'rooms' ? t.common.rooms : t.common.furniture}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* ── ROOMS TAB ─────────────────────────────── */}
        {activeTab === 'rooms' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] mb-1">{t.sidebar.yourRooms}</div>
              {rooms.map(room => {
                const roomFurnCount = furniture.filter(f => f.roomId === room.id).length;
                return (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors font-medium ${activeRoomId === room.id ? 'bg-[#ece8df] text-[#4a4a38]' : 'hover:bg-[#f1eee6] text-[#6a6658]'}`}
                    onClick={() => setActiveRoom(room.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm">{room.name}</span>
                      {roomFurnCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#8a9a5b] text-white text-[10px] font-bold rounded-full shrink-0" title={`${roomFurnCount} ${t.common.furniture.toLowerCase()}`}>
                          {roomFurnCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                      aria-label={`${t.common.delete} ${room.name}`}
                      title={t.common.delete}
                      className="text-[#c0bdb4] hover:text-red-400 p-1 rounded hover:bg-red-50 shrink-0 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
              <div className="flex flex-col gap-2 mt-2">
                {/* 1. New Empty Room Button */}
                <button
                  onClick={handleAddRoom}
                  aria-label={t.sidebar.newRoom}
                  className="w-full p-2.5 rounded-xl border border-dashed border-[#d6d1c2] hover:border-[#8a9a5b] text-[#6a6658] hover:text-[#4a4a38] hover:bg-[#f5f3ee] flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-2xs"
                >
                  <Plus size={14} aria-hidden="true" className="text-[#8a9a5b]" />
                  <span>{t.sidebar.newRoom}</span>
                </button>

                {/* 2. Pre-furnished Sample Room Button */}
                <button
                  onClick={() => addDemoRoom(getDemoData(language))}
                  title={t.sidebar.addDemoRoomTip}
                  aria-label={t.sidebar.addDemoRoomTip}
                  className="w-full p-2.5 rounded-xl border border-[#e5e1d8] hover:border-[#8a9a5b] bg-white hover:bg-[#f9f7f2] flex items-center justify-between transition-all group shadow-2xs text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#f2f6ee] text-[#7a8c4b] border border-[#d6d1c2]/60 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#8a9a5b] group-hover:text-white transition-colors" aria-hidden="true">
                      <Sparkles size={13} />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-semibold text-[#4a4a38] group-hover:text-[#6f7e45] transition-colors truncate">
                        {t.sidebar.addSampleRoom}
                      </span>
                      <span className="text-[10px] text-[#8a8678] truncate">
                        {t.sidebar.sampleRoomSubtitle}
                      </span>
                    </div>
                  </div>
                  <Plus size={13} aria-hidden="true" className="text-[#8a9a5b] shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all ml-1.5" />
                </button>

                {/* 3. AI Room Scan Button (feature-flagged) */}
                {isEnabled('aiImageToRoom') && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-image-to-room'))}
                    aria-label={t.imageToRoom.buttonLabel}
                    className="w-full p-2.5 rounded-xl border border-[#e5e1d8] hover:border-[#8a9a5b] bg-white hover:bg-[#f1eee6] flex items-center justify-between transition-all group shadow-2xs text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#f0f5ee] text-[#6f7e45] border border-[#d6d1c2] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#8a9a5b] group-hover:text-white transition-colors" aria-hidden="true">
                        <Camera size={13} />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-xs font-semibold text-[#4a4a38] group-hover:text-[#6f7e45] transition-colors truncate">
                          {t.imageToRoom.buttonLabel}
                        </span>
                        <span className="text-[10px] text-[#8a8678] truncate">AI · Gemini Vision</span>
                      </div>
                    </div>
                    <Camera size={13} aria-hidden="true" className="text-[#8a9a5b] shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all ml-1.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Room edit panel */}
            {activeRoom && (
              <div className="mt-2 pt-4 border-t border-[#e5e1d8] flex flex-col gap-3">
                <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] flex items-center gap-1">
                  <Settings2 size={11} /> {t.sidebar.editRoom}
                </div>
                <input
                  className="bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-2 text-sm focus:border-[#8a9a5b] outline-none shadow-sm"
                  value={activeRoom.name}
                  onChange={(e) => updateRoom(activeRoom.id, { name: e.target.value })}
                  placeholder={t.sidebar.roomNamePlaceholder}
                  aria-label={t.sidebar.roomNamePlaceholder}
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1" htmlFor="room-width-input">{t.common.width} (m)</label>
                    <input id="room-width-input" type="number" step="0.5" aria-label={`${t.common.width} (m)`} className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm" value={activeRoom.width} onChange={e => updateRoom(activeRoom.id, { width: parseFloat(e.target.value) || 1 })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1" htmlFor="room-depth-input">{t.common.depth} (m)</label>
                    <input id="room-depth-input" type="number" step="0.5" aria-label={`${t.common.depth} (m)`} className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm" value={activeRoom.depth} onChange={e => updateRoom(activeRoom.id, { depth: parseFloat(e.target.value) || 1 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1" htmlFor="room-floor-color">{t.common.floorColor}</label>
                    <input id="room-floor-color" type="color" aria-label={t.common.floorColor} className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5 shadow-sm" value={activeRoom.floorColor} onChange={e => updateRoom(activeRoom.id, { floorColor: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1" htmlFor="room-wall-color">{t.common.wallColor}</label>
                    <input id="room-wall-color" type="color" aria-label={t.common.wallColor} className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5 shadow-sm" value={activeRoom.wallColor} onChange={e => updateRoom(activeRoom.id, { wallColor: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FURNITURE TAB ─────────────────────────── */}
        {activeTab === 'furniture' && (
          <div className="p-4 flex flex-col gap-4 pb-12">
            {!activeRoomId ? (
              <div className="text-sm text-[#a39f90] text-center mt-4 p-4 border border-dashed border-[#d6d1c2] rounded-lg bg-[#f5f3ee]">
                {t.sidebar.selectRoomFirst}
              </div>
            ) : (
              <>
                {/* Furniture Catalog */}
                <div>
                  <button
                    className="w-full flex items-center justify-between text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] mb-2 hover:text-[#8a9a5b] transition-colors"
                    onClick={() => setCatalogOpen(v => !v)}
                    aria-expanded={catalogOpen}
                    aria-label={t.sidebar.addFurniture}
                  >
                    <span className="flex items-center gap-1.5">
                      {t.sidebar.addFurniture}
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#ece8df] rounded-full text-[#7a7668]">
                        {FURNITURE_PRESET_LIST.length}
                      </span>
                    </span>
                    {catalogOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {catalogOpen && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {FURNITURE_PRESET_LIST.map(preset => (
                        <button
                          key={preset.id}
                          title={t.furniturePresets[preset.id]?.desc || preset.description}
                          aria-label={`${t.sidebar.addFurniture} ${t.furniturePresets[preset.id]?.label || preset.label}`}
                          onClick={() => handleAddFurnitureType(preset.id)}
                          className="flex items-center gap-2 px-2.5 py-2 bg-white hover:bg-[#f5f3ee] border border-[#e5e1d8] hover:border-[#8a9a5b] rounded-lg transition-all group shadow-2xs text-left"
                        >
                          <FurnitureIcon type={preset.id} size={18} className="text-[#6f7e45] shrink-0" />
                          <span className="text-xs font-medium text-[#4a4a38] group-hover:text-[#8a9a5b] transition-colors truncate">
                            {t.furniturePresets[preset.id]?.label || preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Furniture List */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.12em]">
                    <span className="truncate flex-1 min-w-0" title={`${activeRoom?.name} · ${activeRoomFurniture.length} ${t.common.pieces}`}>
                      {activeRoom?.name} · {activeRoomFurniture.length} {t.common.pieces}
                    </span>
                    {activeRoomFurniture.length > 0 && (
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-batch-qr', { detail: activeRoomId }))}
                        title={t.sidebar.printStickers}
                        aria-label={t.sidebar.printStickers}
                        className="shrink-0 whitespace-nowrap text-[#7a8c4b] hover:text-[#5f6f36] hover:underline flex items-center gap-1 font-bold lowercase first-letter:uppercase"
                      >
                        <QrCode size={11} aria-hidden="true" />
                        {t.sidebar.printStickers}
                      </button>
                    )}
                  </div>
                  {activeRoomFurniture.length === 0 && (
                    <div className="text-xs text-[#a39f90] text-center p-3 border border-dashed border-[#d6d1c2] rounded-lg">
                      {t.sidebar.noFurnitureInRoom}
                    </div>
                  )}
                  {activeRoomFurniture.map(f => {
                    const itemCount = getFurnitureItemCount(f.id);
                    return (
                      <div
                        key={f.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${f.name}, ${itemCount} ${t.common.items.toLowerCase()}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveFurniture(f.id);
                            window.dispatchEvent(new CustomEvent('open-furniture', { detail: f.id }));
                          }
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all border ${
                          activeFurnitureId === f.id
                            ? 'bg-[#ece8df] border-[#8a9a5b] text-[#4a4a38] shadow-xs'
                            : 'bg-white hover:bg-[#f9f7f2] border-[#e5e1d8] text-[#555245]'
                        }`}
                        onClick={() => {
                          setActiveFurniture(f.id);
                          window.dispatchEvent(new CustomEvent('open-furniture', { detail: f.id }));
                        }}
                        title={t.sidebar.viewItems}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <FurnitureIcon type={f.type} size={18} className="text-[#6f7e45] shrink-0" aria-hidden="true" />
                          <span className="truncate text-sm font-semibold text-[#4a4a38]">{f.name}</span>
                          {itemCount > 0 && (
                            <span
                              className="px-1.5 py-0.5 bg-[#8a9a5b] text-white text-[10px] font-bold rounded-full shrink-0"
                              title={`${itemCount} ${t.common.items.toLowerCase()}`}
                            >
                              {itemCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            title={t.contentsModal.qrSticker}
                            aria-label={`${t.contentsModal.qrSticker} - ${f.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.dispatchEvent(new CustomEvent('open-qr-label', { detail: f.id }));
                            }}
                            className="text-[#7a8c4b] hover:text-[#5f6f36] p-1.5 bg-[#f9f7f2] hover:bg-[#f2f6ee] border border-[#d6d1c2] rounded-lg transition-colors"
                          >
                            <QrCode size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title={t.common.delete}
                            aria-label={`${t.common.delete} ${f.name}`}
                            onClick={(e) => { e.stopPropagation(); deleteFurniture(f.id); }}
                            className="text-[#c0bdb4] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Furniture Edit Panel */}
            {activeFurn && (
              <div className="mt-2 pt-4 border-t border-[#e5e1d8] flex flex-col gap-3">
                <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Settings2 size={11} aria-hidden="true" /> <FurnitureIcon type={activeFurn.type} size={12} className="text-[#6f7e45]" aria-hidden="true" /> {t.furniturePresets[activeFurn.type]?.label || activeFurn.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveFurniture(null)}
                    className="text-[#a39f90] hover:text-[#4a4a38] p-1 rounded hover:bg-[#ece8df] transition-colors"
                    title={t.common.cancel}
                    aria-label={t.common.cancel}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-furniture', { detail: activeFurn.id }))}
                    aria-label={`${t.sidebar.viewItems} (${getFurnitureItemCount(activeFurn.id)})`}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#8a9a5b] hover:bg-[#7a8a4b] text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Box size={14} aria-hidden="true" /> {t.sidebar.viewItems} ({getFurnitureItemCount(activeFurn.id)})
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-qr-label', { detail: activeFurn.id }))}
                    className="px-3 py-2 rounded-lg bg-white hover:bg-[#f2f6ee] text-[#7a8c4b] border border-[#d6d1c2] flex items-center justify-center gap-1.5 text-xs font-semibold shadow-2xs transition-colors"
                    title={t.contentsModal.qrSticker}
                    aria-label={t.contentsModal.qrSticker}
                  >
                    <QrCode size={13} aria-hidden="true" /> QR
                  </button>
                </div>

                <div>
                  <label htmlFor="furn-name-input" className="text-xs text-[#a39f90] block mb-1">
                    {t.common.name || 'Tên'}
                  </label>
                  <input
                    id="furn-name-input"
                    className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-2 text-sm focus:border-[#8a9a5b] outline-none shadow-sm"
                    value={activeFurn.name}
                    onChange={(e) => updateFurniture(activeFurn.id, { name: e.target.value })}
                    placeholder={t.sidebar.furnitureNamePlaceholder}
                    aria-label={t.sidebar.furnitureNamePlaceholder}
                  />
                </div>
                <div>
                  <label htmlFor="furn-color-input" className="text-xs text-[#a39f90] block mb-1">{t.common.color}</label>
                  <input
                    id="furn-color-input"
                    type="color"
                    aria-label={t.common.color}
                    className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5 shadow-sm"
                    value={activeFurn.color}
                    onChange={e => updateFurniture(activeFurn.id, { color: e.target.value })}
                  />
                </div>
                <div className="text-xs text-[#a39f90] font-semibold mt-1">{t.common.position} (X / Z)</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label htmlFor="furn-pos-x" className="text-[10px] text-[#a39f90] block mb-1">X</label>
                    <input
                      id="furn-pos-x"
                      type="number"
                      step="0.25"
                      aria-label="Tọa độ X (Position X)"
                      className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm"
                      value={activeFurn.position[0]}
                      onChange={e => updateFurniture(activeFurn.id, { position: [parseFloat(e.target.value) || 0, 0, activeFurn.position[2]] })}
                    />
                  </div>
                  <div>
                    <label htmlFor="furn-pos-z" className="text-[10px] text-[#a39f90] block mb-1">Z</label>
                    <input
                      id="furn-pos-z"
                      type="number"
                      step="0.25"
                      aria-label="Tọa độ Z (Position Z)"
                      className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm"
                      value={activeFurn.position[2]}
                      onChange={e => updateFurniture(activeFurn.id, { position: [activeFurn.position[0], 0, parseFloat(e.target.value) || 0] })}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-[#a39f90] font-semibold mt-1 mb-1">
                    <label htmlFor="furn-rotation-slider">{t.common.rotation}</label>
                    <span>{Math.round((activeFurn.rotation[1] * 180) / Math.PI)}°</span>
                  </div>
                  <input
                    id="furn-rotation-slider"
                    type="range"
                    min="-180"
                    max="180"
                    step="15"
                    aria-label={t.common.rotation}
                    aria-valuemin={-180}
                    aria-valuemax={180}
                    aria-valuenow={Math.round((activeFurn.rotation[1] * 180) / Math.PI)}
                    className="w-full accent-[#8a9a5b]"
                    value={(activeFurn.rotation[1] * 180) / Math.PI}
                    onChange={e => updateFurniture(activeFurn.id, { rotation: [0, (parseFloat(e.target.value) * Math.PI) / 180, 0] })}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#e5e1d8] text-sm flex gap-3 shrink-0 bg-[#f5f3ee]">
        <button
          onClick={handleExport}
          aria-label={t.common.export}
          className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#f9f7f2] flex items-center justify-center gap-2 text-[#8a8678] hover:text-[#4a4a38] transition-colors border border-[#e5e1d8] shadow-sm"
        >
          <FolderUp size={14} aria-hidden="true" /> {t.common.export}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label={t.common.import}
          className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#f9f7f2] flex items-center justify-center gap-2 text-[#8a8678] hover:text-[#4a4a38] transition-colors border border-[#e5e1d8] shadow-sm"
        >
          <FolderDown size={14} aria-hidden="true" /> {t.common.import}
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
          aria-label={t.common.import}
        />
      </div>
    </aside>
    </>
  );
}

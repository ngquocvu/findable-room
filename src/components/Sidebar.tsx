"use client";

import { useStore } from '@/src/store/useStore';
import { Plus, Trash2, Settings2, FolderDown, FolderUp, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState, useRef } from 'react';
import { FURNITURE_PRESET_LIST, FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { getDemoData } from '@/src/lib/demoData';
import { FurnitureType } from '@/src/types';

export function Sidebar() {
  const store = useStore();
  const {
    rooms, activeRoomId, setActiveRoom, addRoom, deleteRoom, updateRoom,
    furniture, addFurniture, setActiveFurniture, activeFurnitureId, deleteFurniture,
    updateFurniture, importData, items
  } = store;

  const [activeTab, setActiveTab] = useState<'rooms' | 'furniture'>('rooms');
  const [catalogOpen, setCatalogOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeRoomFurniture = furniture.filter(f => f.roomId === activeRoomId);
  const activeFurn = furniture.find(f => f.id === activeFurnitureId);

  const handleAddRoom = () => {
    const newRoom = {
      id: uuidv4(),
      name: `Room ${rooms.length + 1}`,
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
      name: preset.label,
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
          alert('Invalid backup file');
        }
      } catch {
        alert('Failed to parse file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFurnitureItemCount = (furnitureId: string) =>
    items.filter(i => i.furnitureId === furnitureId).length;

  return (
    <div className="w-72 bg-[#f9f7f2] border-r border-[#e5e1d8] flex flex-col h-full overflow-hidden text-[#4a4a38]">
      {/* Logo */}
      <div className="p-5 border-b border-[#e5e1d8] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#8a9a5b] flex items-center justify-center rounded-lg shadow-sm">
          <div className="w-4 h-4 bg-white rounded-sm opacity-80" />
        </div>
        <span className="text-lg font-bold tracking-tight text-[#4a4a38]" style={{ fontFamily: 'Georgia, serif' }}>
          RoomFindable
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e1d8] text-sm shrink-0">
        {(['rooms', 'furniture'] as const).map(tab => (
          <button
            key={tab}
            className={`flex-1 p-3 text-center transition-colors font-medium capitalize ${activeTab === tab ? 'border-b-2 border-[#8a9a5b] text-[#4a4a38]' : 'text-[#a39f90] hover:text-[#4a4a38]'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* ── ROOMS TAB ─────────────────────────────── */}
        {activeTab === 'rooms' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] mb-1">Your Rooms</div>
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
                        <span className="px-1.5 py-0.5 bg-[#8a9a5b] text-white text-[10px] font-bold rounded-full shrink-0">
                          {roomFurnCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                      className="text-[#c0bdb4] hover:text-red-400 p-1 rounded hover:bg-red-50 shrink-0 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleAddRoom}
                  className="flex-1 p-2.5 rounded-lg border border-dashed border-[#d6d1c2] text-[#a39f90] hover:text-[#8a9a5b] hover:border-[#8a9a5b] hover:bg-[#f5f3ee] flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <Plus size={13} /> New Room
                </button>
                <button
                  onClick={() => importData(getDemoData())}
                  title="Load sample room with furniture & items"
                  className="px-3 p-2.5 rounded-lg border border-[#d6d1c2] text-[#7a8c4b] hover:text-[#5f6f36] hover:border-[#8a9a5b] bg-white hover:bg-[#f2f6ee] flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors shadow-xs"
                >
                  <Sparkles size={12} className="text-[#8a9a5b]" /> Demo
                </button>
              </div>
            </div>

            {/* Room edit panel */}
            {activeRoom && (
              <div className="mt-2 pt-4 border-t border-[#e5e1d8] flex flex-col gap-3">
                <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] flex items-center gap-1">
                  <Settings2 size={11} /> Edit Room
                </div>
                <input
                  className="bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-2 text-sm focus:border-[#8a9a5b] outline-none shadow-sm"
                  value={activeRoom.name}
                  onChange={(e) => updateRoom(activeRoom.id, { name: e.target.value })}
                  placeholder="Room Name"
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1">Width (m)</label>
                    <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm" value={activeRoom.width} onChange={e => updateRoom(activeRoom.id, { width: parseFloat(e.target.value) || 1 })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1">Depth (m)</label>
                    <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm" value={activeRoom.depth} onChange={e => updateRoom(activeRoom.id, { depth: parseFloat(e.target.value) || 1 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1">Floor Color</label>
                    <input type="color" className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5 shadow-sm" value={activeRoom.floorColor} onChange={e => updateRoom(activeRoom.id, { floorColor: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1">Wall Color</label>
                    <input type="color" className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5 shadow-sm" value={activeRoom.wallColor} onChange={e => updateRoom(activeRoom.id, { wallColor: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FURNITURE TAB ─────────────────────────── */}
        {activeTab === 'furniture' && (
          <div className="p-4 flex flex-col gap-4">
            {!activeRoomId ? (
              <div className="text-sm text-[#a39f90] text-center mt-4 p-4 border border-dashed border-[#d6d1c2] rounded-lg bg-[#f5f3ee]">
                Select a room first
              </div>
            ) : (
              <>
                {/* Furniture Catalog */}
                <div>
                  <button
                    className="w-full flex items-center justify-between text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] mb-2 hover:text-[#8a9a5b] transition-colors"
                    onClick={() => setCatalogOpen(v => !v)}
                  >
                    <span>Add Furniture</span>
                    {catalogOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {catalogOpen && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {FURNITURE_PRESET_LIST.map(preset => (
                        <button
                          key={preset.id}
                          title={preset.description}
                          onClick={() => handleAddFurnitureType(preset.id)}
                          className="flex flex-col items-center gap-1.5 p-3 bg-white hover:bg-[#f5f3ee] border border-[#e5e1d8] hover:border-[#8a9a5b] rounded-xl transition-all group shadow-sm"
                        >
                          <span className="text-2xl">{preset.icon}</span>
                          <span className="text-[10px] font-semibold text-[#8a8678] group-hover:text-[#8a9a5b] transition-colors capitalize">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Furniture List */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em]">
                    {activeRoom?.name} · {activeRoomFurniture.length} pieces
                  </div>
                  {activeRoomFurniture.length === 0 && (
                    <div className="text-xs text-[#a39f90] text-center p-3 border border-dashed border-[#d6d1c2] rounded-lg">
                      Click a type above to add furniture
                    </div>
                  )}
                  {activeRoomFurniture.map(f => {
                    const itemCount = getFurnitureItemCount(f.id);
                    const preset = FURNITURE_PRESETS[f.type];
                    return (
                      <div
                        key={f.id}
                        className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${activeFurnitureId === f.id ? 'bg-[#ece8df] text-[#4a4a38]' : 'hover:bg-[#f1eee6] text-[#6a6658]'}`}
                        onClick={() => setActiveFurniture(f.id)}
                        onDoubleClick={() => window.dispatchEvent(new CustomEvent('open-furniture', { detail: f.id }))}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{preset?.icon ?? '📦'}</span>
                          <span className="truncate text-sm font-medium">{f.name}</span>
                          {itemCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-[#8a9a5b] text-white text-[10px] font-bold rounded-full shrink-0">
                              {itemCount}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFurniture(f.id); }}
                          className="text-[#c0bdb4] hover:text-red-400 p-1 rounded hover:bg-red-50 shrink-0 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Furniture Edit Panel */}
            {activeFurn && (
              <div className="mt-2 pt-4 border-t border-[#e5e1d8] flex flex-col gap-3">
                <div className="text-[10px] font-semibold text-[#a39f90] uppercase tracking-[0.15em] flex items-center gap-1">
                  <Settings2 size={11} /> {FURNITURE_PRESETS[activeFurn.type]?.icon} {activeFurn.type}
                </div>
                <input
                  className="bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-2 text-sm focus:border-[#8a9a5b] outline-none shadow-sm"
                  value={activeFurn.name}
                  onChange={(e) => updateFurniture(activeFurn.id, { name: e.target.value })}
                  placeholder="Furniture Name"
                />
                <div>
                  <label className="text-xs text-[#a39f90] block mb-1">Color</label>
                  <input type="color" className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5 shadow-sm" value={activeFurn.color} onChange={e => updateFurniture(activeFurn.id, { color: e.target.value })} />
                </div>
                <div className="text-xs text-[#a39f90] font-semibold mt-1">Position (X / Z)</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-[10px] text-[#a39f90] block mb-1">X</label>
                    <input type="number" step="0.25" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm" value={activeFurn.position[0]} onChange={e => updateFurniture(activeFurn.id, { position: [parseFloat(e.target.value) || 0, 0, activeFurn.position[2]] })} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#a39f90] block mb-1">Z</label>
                    <input type="number" step="0.25" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none focus:border-[#8a9a5b] shadow-sm" value={activeFurn.position[2]} onChange={e => updateFurniture(activeFurn.id, { position: [activeFurn.position[0], 0, parseFloat(e.target.value) || 0] })} />
                  </div>
                </div>
                <div className="text-xs text-[#a39f90] font-semibold mt-1">Rotation</div>
                <input
                  type="range" min="-180" max="180" step="15"
                  className="w-full accent-[#8a9a5b]"
                  value={(activeFurn.rotation[1] * 180) / Math.PI}
                  onChange={e => updateFurniture(activeFurn.id, { rotation: [0, (parseFloat(e.target.value) * Math.PI) / 180, 0] })}
                />
                <div className="text-center text-xs text-[#a39f90]">
                  {Math.round((activeFurn.rotation[1] * 180) / Math.PI)}°
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#e5e1d8] text-sm flex gap-3 shrink-0 bg-[#f5f3ee]">
        <button onClick={handleExport} className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#f9f7f2] flex items-center justify-center gap-2 text-[#8a8678] hover:text-[#4a4a38] transition-colors border border-[#e5e1d8] shadow-sm">
          <FolderUp size={14} /> Export
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#f9f7f2] flex items-center justify-center gap-2 text-[#8a8678] hover:text-[#4a4a38] transition-colors border border-[#e5e1d8] shadow-sm">
          <FolderDown size={14} /> Import
        </button>
        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
      </div>
    </div>
  );
}

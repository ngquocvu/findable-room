"use client";

import { useStore } from '@/src/store/useStore';
import { Plus, Trash2, Box, LogIn, LogOut, Settings2, FolderDown, FolderUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState, useRef } from 'react';
import { FurnitureType } from '@/src/types';

export function Sidebar() {
  const store = useStore();
  const { rooms, activeRoomId, setActiveRoom, addRoom, deleteRoom, updateRoom, furniture, addFurniture, setActiveFurniture, activeFurnitureId, deleteFurniture, updateFurniture, importData } = store;
  
  const [activeTab, setActiveTab] = useState<'rooms' | 'furniture'>('rooms');
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
      floorColor: '#d8d3c5',
      wallColor: '#f1efe9'
    };
    addRoom(newRoom);
  };

  const handleAddFurniture = () => {
    if (!activeRoomId) return;
    const newFurniture = {
      id: uuidv4(),
      roomId: activeRoomId,
      name: `New Furniture`,
      type: 'wardrobe' as FurnitureType,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      dimensions: [1, 2, 1] as [number, number, number],
      color: '#8b5a2b'
    };
    addFurniture(newFurniture);
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
      } catch (err) {
        alert('Failed to parse file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-72 bg-[#f9f7f2] border-r border-[#e5e1d8] flex flex-col h-full overflow-hidden text-[#4a4a38]">
      <div className="p-6 border-b border-[#e5e1d8] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#8a9a5b] flex items-center justify-center rounded-sm border-2 border-[#4a4a38] shadow-[2px_2px_0_0_#4a4a38]">
          <div className="w-4 h-4 bg-white/40 rounded-sm"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-[#2c2c2c]" style={{ fontFamily: 'Georgia, serif' }}>RoomFindable</span>
      </div>
      
      <div className="flex border-b border-[#e5e1d8] text-sm shrink-0">
        <button 
          className={`flex-1 p-3 text-center transition-colors font-medium ${activeTab === 'rooms' ? 'border-b-2 border-[#8a9a5b] text-[#8a9a5b]' : 'text-[#8a8678] hover:text-[#4a4a38]'}`}
          onClick={() => setActiveTab('rooms')}
        >
          Rooms
        </button>
        <button 
          className={`flex-1 p-3 text-center transition-colors font-medium ${activeTab === 'furniture' ? 'border-b-2 border-[#8a9a5b] text-[#8a9a5b]' : 'text-[#8a8678] hover:text-[#4a4a38]'}`}
          onClick={() => setActiveTab('furniture')}
        >
          Furniture
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === 'rooms' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-[0.2em] mb-1">Your Rooms</div>
              {rooms.map(room => (
                <div 
                  key={room.id}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors font-medium ${activeRoomId === room.id ? 'bg-[#ece8df] border border-[#d6d1c2] text-[#2c2c2c]' : 'hover:bg-[#f1eee6] text-[#8a8678] border border-transparent'}`}
                  onClick={() => setActiveRoom(room.id)}
                >
                  <span className="truncate pr-2 text-sm">{room.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                    className="text-[#a39f90] hover:text-red-500 p-1 rounded hover:bg-white/50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddRoom}
                className="mt-1 p-2 rounded-lg border border-dashed border-[#d6d1c2] text-[#8a8678] hover:text-[#4a4a38] hover:border-[#a39f90] hover:bg-[#f1eee6] flex items-center justify-center gap-2 text-sm transition-colors font-medium"
              >
                <Plus size={14} /> Add Room
              </button>
            </div>

            {activeRoom && (
              <div className="mt-4 pt-4 border-t border-[#e5e1d8] flex flex-col gap-3">
                <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-[0.2em] flex items-center gap-1"><Settings2 size={12}/> Edit Room</div>
                <input 
                  className="bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-2 text-sm focus:border-[#8a9a5b] outline-none shadow-sm"
                  value={activeRoom.name}
                  onChange={(e) => updateRoom(activeRoom.id, { name: e.target.value })}
                  placeholder="Room Name"
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1 font-medium">Width (m)</label>
                    <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeRoom.width} onChange={e => updateRoom(activeRoom.id, { width: parseFloat(e.target.value) || 1 })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1 font-medium">Depth (m)</label>
                    <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeRoom.depth} onChange={e => updateRoom(activeRoom.id, { depth: parseFloat(e.target.value) || 1 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1 font-medium">Floor Color</label>
                    <input type="color" className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5" value={activeRoom.floorColor} onChange={e => updateRoom(activeRoom.id, { floorColor: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-[#a39f90] block mb-1 font-medium">Wall Color</label>
                    <input type="color" className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5" value={activeRoom.wallColor} onChange={e => updateRoom(activeRoom.id, { wallColor: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'furniture' && (
          <div className="p-4 flex flex-col gap-4">
            {!activeRoomId ? (
              <div className="text-sm text-[#8a8678] text-center mt-4 p-4 border border-dashed border-[#d6d1c2] rounded-lg bg-[#f1eee6]">Select a room first</div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-[0.2em] mb-1">{activeRoom?.name} Furniture</div>
                {activeRoomFurniture.map(f => (
                  <div 
                    key={f.id}
                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors font-medium ${activeFurnitureId === f.id ? 'bg-[#ece8df] border border-[#d6d1c2] text-[#2c2c2c]' : 'hover:bg-[#f1eee6] text-[#8a8678] border border-transparent'}`}
                    onClick={() => setActiveFurniture(f.id)}
                    onDoubleClick={() => window.dispatchEvent(new CustomEvent('open-furniture', { detail: f.id }))}
                  >
                    <span className="truncate pr-2 text-sm">{f.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteFurniture(f.id); }}
                      className="text-[#a39f90] hover:text-red-500 p-1 rounded hover:bg-white/50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={handleAddFurniture}
                  className="mt-1 p-2 rounded-lg border border-dashed border-[#d6d1c2] text-[#8a8678] hover:text-[#4a4a38] hover:border-[#a39f90] hover:bg-[#f1eee6] flex items-center justify-center gap-2 text-sm transition-colors font-medium"
                >
                  <Plus size={14} /> Add Furniture
                </button>
              </div>
            )}

            {activeFurn && (
              <div className="mt-4 pt-4 border-t border-[#e5e1d8] flex flex-col gap-3">
                <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-[0.2em] flex items-center gap-1"><Settings2 size={12}/> Edit Furniture</div>
                <input 
                  className="bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-2 text-sm focus:border-[#8a9a5b] outline-none shadow-sm"
                  value={activeFurn.name}
                  onChange={(e) => updateFurniture(activeFurn.id, { name: e.target.value })}
                  placeholder="Furniture Name"
                />
                
                <div>
                  <label className="text-xs text-[#a39f90] block mb-1 font-medium">Color</label>
                  <input type="color" className="w-full h-8 bg-white border border-[#d6d1c2] rounded-lg cursor-pointer p-0.5" value={activeFurn.color} onChange={e => updateFurniture(activeFurn.id, { color: e.target.value })} />
                </div>

                <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-wide mt-2">Position (X, Y, Z)</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeFurn.position[0]} onChange={e => updateFurniture(activeFurn.id, { position: [parseFloat(e.target.value) || 0, activeFurn.position[1], activeFurn.position[2]] })} />
                  <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeFurn.position[1]} onChange={e => updateFurniture(activeFurn.id, { position: [activeFurn.position[0], parseFloat(e.target.value) || 0, activeFurn.position[2]] })} />
                  <input type="number" step="0.5" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeFurn.position[2]} onChange={e => updateFurniture(activeFurn.id, { position: [activeFurn.position[0], activeFurn.position[1], parseFloat(e.target.value) || 0] })} />
                </div>

                <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-wide mt-2">Size (W, H, D)</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <input type="number" step="0.1" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeFurn.dimensions[0]} onChange={e => updateFurniture(activeFurn.id, { dimensions: [parseFloat(e.target.value) || 1, activeFurn.dimensions[1], activeFurn.dimensions[2]] })} />
                  <input type="number" step="0.1" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeFurn.dimensions[1]} onChange={e => updateFurniture(activeFurn.id, { dimensions: [activeFurn.dimensions[0], parseFloat(e.target.value) || 1, activeFurn.dimensions[2]] })} />
                  <input type="number" step="0.1" className="w-full bg-white border border-[#d6d1c2] text-[#4a4a38] rounded-lg p-1.5 outline-none shadow-sm" value={activeFurn.dimensions[2]} onChange={e => updateFurniture(activeFurn.id, { dimensions: [activeFurn.dimensions[0], activeFurn.dimensions[1], parseFloat(e.target.value) || 1] })} />
                </div>
                
                <div className="text-[10px] font-bold text-[#a39f90] uppercase tracking-wide mt-2">Rotation (Y-Axis)</div>
                <input type="range" min="-180" max="180" step="15" className="w-full accent-[#8a9a5b]" value={(activeFurn.rotation[1] * 180) / Math.PI} onChange={e => updateFurniture(activeFurn.id, { rotation: [0, (parseFloat(e.target.value) * Math.PI) / 180, 0] })} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#e5e1d8] text-sm flex gap-3 shrink-0 bg-[#f9f7f2]">
        <button onClick={handleExport} className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#f1eee6] flex items-center justify-center gap-2 text-[#8a8678] hover:text-[#4a4a38] transition-colors border border-[#d6d1c2] font-medium shadow-sm">
           <FolderUp size={14} /> Export
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#f1eee6] flex items-center justify-center gap-2 text-[#8a8678] hover:text-[#4a4a38] transition-colors border border-[#d6d1c2] font-medium shadow-sm">
           <FolderDown size={14} /> Import
        </button>
        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
      </div>
    </div>
  );
}

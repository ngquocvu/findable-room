"use client";

import { useStore } from '@/src/store/useStore';
import { Search } from 'lucide-react';
import { useEffect } from 'react';

export function TopBar() {
  const { rooms, activeRoomId } = useStore();
  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // We will dispatch a custom event to open the search modal
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-14 border-b border-[#e5e1d8] bg-[#f9f7f2] flex items-center justify-between px-6 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-[#4a4a38]" style={{ fontFamily: 'Georgia, serif' }}>
          {activeRoom ? activeRoom.name : 'RoomFindable'}
        </h2>
        {activeRoom && (
          <span className="text-xs text-[#a39f90]">
            {activeRoom.width}m × {activeRoom.depth}m
          </span>
        )}
      </div>
      <div>
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#f1eee6] text-[#a39f90] hover:text-[#4a4a38] rounded-lg text-sm border border-[#d6d1c2] transition-colors shadow-sm"
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-1 px-1.5 py-0.5 bg-[#f1eee6] rounded text-[10px] text-[#8a8678] border border-[#d6d1c2] font-mono">⌘K</kbd>
        </button>
      </div>
    </div>
  );
}

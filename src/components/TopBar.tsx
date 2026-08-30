"use client";

import { useStore } from '@/src/store/useStore';
import { Search, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export function TopBar() {
  const { rooms, activeRoomId } = useStore();
  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Custom events for modals
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  const openWelcome = () => {
    window.dispatchEvent(new CustomEvent('open-welcome'));
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
    <div className="h-14 border-b border-[#e5e1d8] bg-[#f9f7f2] flex items-center justify-between px-6 z-10 shadow-sm shrink-0">
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
      <div className="flex items-center gap-2">
        <button
          onClick={openWelcome}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f1eee6] text-[#7a8c4b] hover:text-[#5f6f36] rounded-lg text-xs font-semibold border border-[#d6d1c2] transition-colors shadow-sm"
          title="Open Quick Guide & Demo Room"
        >
          <Sparkles size={13} className="text-[#8a9a5b]" />
          <span>Guide & Demo</span>
        </button>

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

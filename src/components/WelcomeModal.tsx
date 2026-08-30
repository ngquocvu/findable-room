"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/src/store/useStore';
import { getDemoData } from '@/src/lib/demoData';
import { Sparkles, Box, Search, Move3d, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { importData, rooms, addRoom, setActiveRoom } = useStore();

  useEffect(() => {
    // Check if user has already seen the welcome modal
    const hasSeen = localStorage.getItem('roomfindable_welcomed');
    if (!hasSeen) {
      setIsOpen(true);
    }

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-welcome', handleOpen);
    return () => window.removeEventListener('open-welcome', handleOpen);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('roomfindable_welcomed', 'true');
    }
    setIsOpen(false);
  };

  const handleLoadDemo = () => {
    const demo = getDemoData();
    importData(demo);
    localStorage.setItem('roomfindable_welcomed', 'true');
    setIsOpen(false);
  };

  const handleStartFresh = () => {
    // If no room exists yet, create one clean room
    if (rooms.length === 0) {
      const defaultRoom = {
        id: uuidv4(),
        name: 'My Room',
        width: 5,
        depth: 5,
        height: 2.8,
        floorColor: '#c8b99a',
        wallColor: '#d4cfc7',
      };
      addRoom(defaultRoom);
      setActiveRoom(defaultRoom.id);
    }
    localStorage.setItem('roomfindable_welcomed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-[#4a4a38] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#8a9a5b] to-[#a3b18a] px-6 py-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-2 backdrop-blur-xs">
            <Sparkles size={12} />
            <span>Smart 3D Inventory</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Welcome to RoomFindable
          </h2>
          <p className="text-white/90 text-sm mt-1 max-w-md">
            Visually design your room in 3D, remember where every single item is stored, and find anything in seconds.
          </p>
        </div>

        {/* Features list */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#f5f3ee] rounded-xl border border-[#e5e1d8] flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8a9a5b] shadow-xs">
                <Move3d size={18} />
              </div>
              <h3 className="font-semibold text-xs text-[#4a4a38]">1. 3D Drag & Drop</h3>
              <p className="text-[11px] text-[#7a7668] leading-relaxed">
                Add wardrobes, desks & beds. Click & drag smoothly across your room.
              </p>
            </div>

            <div className="p-3.5 bg-[#f5f3ee] rounded-xl border border-[#e5e1d8] flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8a9a5b] shadow-xs">
                <Box size={18} />
              </div>
              <h3 className="font-semibold text-xs text-[#4a4a38]">2. Store & Organize</h3>
              <p className="text-[11px] text-[#7a7668] leading-relaxed">
                Double-click any furniture to catalog what items, cables, or documents are inside.
              </p>
            </div>

            <div className="p-3.5 bg-[#f5f3ee] rounded-xl border border-[#e5e1d8] flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8a9a5b] shadow-xs">
                <Search size={18} />
              </div>
              <h3 className="font-semibold text-xs text-[#4a4a38]">3. Instant ⌘K Search</h3>
              <p className="text-[11px] text-[#7a7668] leading-relaxed">
                Type any item name to highlight its exact 3D furniture container in real-time.
              </p>
            </div>
          </div>

          {/* Call to action section: Choose Demo vs Blank */}
          <div className="mt-5 pt-4 border-t border-[#e5e1d8]">
            <div className="text-xs font-semibold text-[#8a8678] uppercase tracking-wider mb-3">
              How would you like to get started?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Demo Room */}
              <button
                onClick={handleLoadDemo}
                className="flex flex-col items-start p-4 rounded-xl border-2 border-[#8a9a5b] bg-[#f2f6ee] hover:bg-[#eaf1e4] text-left transition-all group relative shadow-sm"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6f7e45] uppercase tracking-wide">
                    <Sparkles size={12} /> Recommended
                  </span>
                  <ArrowRight size={14} className="text-[#8a9a5b] group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-sm text-[#4a4a38] group-hover:text-[#323223]">
                  Load Demo Room
                </div>
                <div className="text-[11px] text-[#6e775e] mt-1 leading-snug">
                  Explore a pre-built studio with desk, wardrobe, shelf & 15 categorized sample items.
                </div>
              </button>

              {/* Option B: Blank Room */}
              <button
                onClick={handleStartFresh}
                className="flex flex-col items-start p-4 rounded-xl border border-[#d6d1c2] bg-white hover:bg-[#f9f7f2] text-left transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[11px] font-semibold text-[#a39f90] uppercase tracking-wide">
                    Empty Canvas
                  </span>
                  <ArrowRight size={14} className="text-[#a39f90] group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-sm text-[#4a4a38]">
                  Start Fresh
                </div>
                <div className="text-[11px] text-[#8a8678] mt-1 leading-snug">
                  Begin with a clean room and add your own custom furniture and belongings from scratch.
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#f5f3ee] border-t border-[#e5e1d8] flex items-center justify-between text-xs text-[#8a8678]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded accent-[#8a9a5b] cursor-pointer"
            />
            <span>Don't show this guide on startup</span>
          </label>

          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs text-[#6a6658] hover:text-[#4a4a38] font-medium hover:underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

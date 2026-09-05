"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/src/store/useStore';
import { getDemoData } from '@/src/lib/demoData';
import { Sparkles, Box, Search, Move3d, X, ArrowRight, QrCode, RotateCw, Hand, ZoomIn } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getTranslation } from '@/src/lib/translations';
import { LogoIcon } from '@/src/components/Logo';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { addDemoRoom, rooms, addRoom, setActiveRoom, language } = useStore();
  const t = getTranslation(language);

  useEffect(() => {
    // Check if user has already seen the welcome modal
    const hasSeen = localStorage.getItem('roomfindable_welcomed');
    if (!hasSeen) {
      setIsOpen(true);
    }

    const handleOpen = () => setIsOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('open-welcome', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-welcome', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dontShowAgain]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('roomfindable_welcomed', 'true');
    }
    setIsOpen(false);
  };

  const handleLoadDemo = () => {
    const demo = getDemoData(language);
    addDemoRoom(demo);
    localStorage.setItem('roomfindable_welcomed', 'true');
    setIsOpen(false);
  };

  const handleStartFresh = () => {
    // If no room exists yet, create one clean room
    if (rooms.length === 0) {
      const defaultRoom = {
        id: uuidv4(),
        name: language === 'vi' ? 'Phòng của tôi' : 'My Room',
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className="bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-[#4a4a38] relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#8a9a5b] to-[#a3b18a] px-5 sm:px-6 py-5 sm:py-6 text-white relative shrink-0 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide uppercase mb-2 backdrop-blur-xs">
              <Sparkles size={12} aria-hidden="true" />
              <span>{t.welcomeModal.smartInventoryBadge}</span>
            </div>
            <h2 id="welcome-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {t.welcomeModal.title}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-md">
              {t.welcomeModal.subtitle}
            </p>
          </div>
          <div className="hidden sm:flex p-2.5 bg-white/15 backdrop-blur-xs rounded-2xl border border-white/20 shadow-sm shrink-0 items-center justify-center">
            <LogoIcon size={44} />
          </div>
          <button
            onClick={handleClose}
            aria-label={t.common.close}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* 4 Core Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#f9f7f2] rounded-xl border border-[#e5e1d8] flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8a9a5b] shadow-xs shrink-0 mt-0.5" aria-hidden="true">
                <Move3d size={17} />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#323223]">{t.welcomeModal.step1Title}</h3>
                <p className="text-[11px] text-[#7a7668] leading-relaxed mt-0.5">
                  {t.welcomeModal.step1Desc}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#f9f7f2] rounded-xl border border-[#e5e1d8] flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8a9a5b] shadow-xs shrink-0 mt-0.5" aria-hidden="true">
                <Box size={17} />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#323223]">{t.welcomeModal.step2Title}</h3>
                <p className="text-[11px] text-[#7a7668] leading-relaxed mt-0.5">
                  {t.welcomeModal.step2Desc}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#f9f7f2] rounded-xl border border-[#e5e1d8] flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#8a9a5b] shadow-xs shrink-0 mt-0.5" aria-hidden="true">
                <Search size={17} />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#323223]">{t.welcomeModal.step3Title}</h3>
                <p className="text-[11px] text-[#7a7668] leading-relaxed mt-0.5">
                  {t.welcomeModal.step3Desc}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#f9f7f2] rounded-xl border border-[#e5e1d8] flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#7a8c4b] shadow-xs shrink-0 mt-0.5" aria-hidden="true">
                <QrCode size={17} />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-[#323223]">{t.welcomeModal.step4Title}</h3>
                <p className="text-[11px] text-[#7a7668] leading-relaxed mt-0.5">
                  {t.welcomeModal.step4Desc}
                </p>
              </div>
            </div>
          </div>

          {/* 3D Navigation Controls Cheat-sheet */}
          <div className="p-3.5 bg-[#f5f3ee] rounded-xl border border-[#e5e1d8] text-xs">
            <div className="font-bold text-[11px] text-[#6e775e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#8a9a5b]" aria-hidden="true" />
              <span>{t.welcomeModal.controlsTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#555245]">
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e1d8] shadow-2xs">
                <RotateCw size={14} className="text-[#8a9a5b] shrink-0" aria-hidden="true" />
                <span className="truncate">{t.welcomeModal.controlRotate}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e1d8] shadow-2xs">
                <Hand size={14} className="text-[#8a9a5b] shrink-0" aria-hidden="true" />
                <span className="truncate">{t.welcomeModal.controlPan}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e1d8] shadow-2xs">
                <ZoomIn size={14} className="text-[#8a9a5b] shrink-0" aria-hidden="true" />
                <span className="truncate">{t.welcomeModal.controlZoom}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#e5e1d8] shadow-2xs">
                <Box size={14} className="text-[#8a9a5b] shrink-0" aria-hidden="true" />
                <span className="truncate">{t.welcomeModal.controlOpen}</span>
              </div>
            </div>
          </div>

          {/* Call to action section: Choose Demo vs Blank */}
          <div className="mt-2 pt-3 border-t border-[#e5e1d8]">
            <div className="text-xs font-semibold text-[#8a8678] uppercase tracking-wider mb-2.5">
              {t.welcomeModal.getStartedPrompt}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Demo Room */}
              <button
                onClick={handleLoadDemo}
                aria-label={`${t.welcomeModal.loadDemoTitle}: ${t.welcomeModal.loadDemoDesc}`}
                className="flex flex-col items-start p-3.5 sm:p-4 rounded-xl border-2 border-[#8a9a5b] bg-[#f2f6ee] hover:bg-[#eaf1e4] text-left transition-all group relative shadow-sm"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6f7e45] uppercase tracking-wide">
                    <Sparkles size={12} aria-hidden="true" /> {t.welcomeModal.recommended}
                  </span>
                  <ArrowRight size={14} aria-hidden="true" className="text-[#8a9a5b] group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-sm text-[#323223]">
                  {t.welcomeModal.loadDemoTitle}
                </div>
                <div className="text-[11px] text-[#6e775e] mt-1 leading-snug">
                  {t.welcomeModal.loadDemoDesc}
                </div>
              </button>

              {/* Option B: Blank Room */}
              <button
                onClick={handleStartFresh}
                aria-label={`${t.welcomeModal.startFreshTitle}: ${t.welcomeModal.startFreshDesc}`}
                className="flex flex-col items-start p-3.5 sm:p-4 rounded-xl border border-[#d6d1c2] bg-white hover:bg-[#f9f7f2] text-left transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[11px] font-semibold text-[#a39f90] uppercase tracking-wide">
                    {t.welcomeModal.emptyCanvas}
                  </span>
                  <ArrowRight size={14} aria-hidden="true" className="text-[#a39f90] group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-sm text-[#4a4a38]">
                  {t.welcomeModal.startFreshTitle}
                </div>
                <div className="text-[11px] text-[#8a8678] mt-1 leading-snug">
                  {t.welcomeModal.startFreshDesc}
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
            <span>{t.welcomeModal.dontShowAgain}</span>
          </label>

          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs text-[#6a6658] hover:text-[#4a4a38] font-medium hover:underline"
          >
            {t.welcomeModal.skipForNow}
          </button>
        </div>
      </div>
    </div>
  );
}

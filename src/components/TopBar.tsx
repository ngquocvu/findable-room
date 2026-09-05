"use client";

import { useStore } from '@/src/store/useStore';
import { getTranslation } from '@/src/lib/translations';
import { Search, Sparkles, QrCode, Menu, Globe } from 'lucide-react';
import { useEffect } from 'react';
import { LogoIcon } from '@/src/components/Logo';

export function TopBar() {
  const { rooms, activeRoomId, language, setLanguage } = useStore();
  const t = getTranslation(language);
  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Custom events for modals
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  const openWelcome = () => {
    window.dispatchEvent(new CustomEvent('open-welcome'));
  };

  const openBatchQR = () => {
    window.dispatchEvent(new CustomEvent('open-batch-qr', { detail: activeRoomId }));
  };

  const openMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-sidebar'));
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
    <header role="banner" className="h-14 border-b border-[#e5e1d8] bg-[#f9f7f2] flex items-center justify-between px-3 sm:px-5 z-10 shadow-sm shrink-0 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile menu trigger */}
        <button
          onClick={openMobileSidebar}
          className="md:hidden p-2 text-[#4a4a38] hover:bg-[#f1eee6] rounded-xl transition-colors shrink-0"
          title={language === 'vi' ? 'Mở danh sách phòng' : 'Open rooms menu'}
          aria-label={language === 'vi' ? 'Mở danh sách phòng' : 'Open rooms menu'}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center justify-center shrink-0">
            <LogoIcon size={22} />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-[#4a4a38] truncate" style={{ fontFamily: 'Georgia, serif' }}>
            {activeRoom ? activeRoom.name : 'RoomFindable'}
          </h1>
          {activeRoom && (
            <span className="text-[10px] sm:text-xs text-[#8a8678] shrink-0 bg-[#ece8df]/70 px-2 py-0.5 rounded-md font-medium">
              {activeRoom.width}m × {activeRoom.depth}m
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#f1eee6] text-[#4a4a38] rounded-lg text-xs font-semibold border border-[#d6d1c2] transition-colors shadow-2xs shrink-0"
          title={language === 'vi' ? 'Chuyển sang English' : 'Switch to Vietnamese'}
          aria-label={language === 'vi' ? 'Chuyển sang English' : 'Switch to Vietnamese'}
        >
          <Globe size={13} aria-hidden="true" className="text-[#8a9a5b]" />
          <span className="font-bold">{language === 'vi' ? 'VN' : 'EN'}</span>
        </button>

        <button
          onClick={openBatchQR}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#f1eee6] text-[#4a4a38] rounded-lg text-xs font-semibold border border-[#d6d1c2] transition-colors shadow-sm shrink-0"
          title={t.topbar.printQR}
          aria-label={t.topbar.printQR}
        >
          <QrCode size={13} aria-hidden="true" className="text-[#8a9a5b]" />
          <span className="hidden xl:inline">{t.topbar.printQR}</span>
        </button>

        <button
          onClick={openWelcome}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#f1eee6] text-[#7a8c4b] hover:text-[#5f6f36] rounded-lg text-xs font-semibold border border-[#d6d1c2] transition-colors shadow-sm shrink-0"
          title={t.topbar.guideDemo}
          aria-label={t.topbar.guideDemo}
        >
          <Sparkles size={13} aria-hidden="true" className="text-[#8a9a5b]" />
          <span className="hidden lg:inline">{t.topbar.guideDemo}</span>
        </button>

        <button
          onClick={openSearch}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#f1eee6] text-[#a39f90] hover:text-[#4a4a38] rounded-lg text-xs sm:text-sm border border-[#d6d1c2] transition-colors shadow-sm shrink-0"
          title={t.topbar.searchPlaceholder}
          aria-label={`${t.topbar.searchPlaceholder} (⌘K)`}
        >
          <Search size={14} aria-hidden="true" />
          <span className="hidden lg:inline">{t.topbar.searchPlaceholder}</span>
          <kbd className="hidden sm:inline ml-0.5 px-1.5 py-0.5 bg-[#f1eee6] rounded text-[10px] text-[#8a8678] border border-[#d6d1c2] font-mono">⌘K</kbd>
        </button>
      </div>
    </header>
  );
}

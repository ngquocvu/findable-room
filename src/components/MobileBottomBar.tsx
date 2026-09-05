"use client";

import { useStore } from '@/src/store/useStore';
import { Menu, Search, QrCode, Sparkles } from 'lucide-react';
import { getTranslation } from '@/src/lib/translations';

export function MobileBottomBar() {
  const { furniture, activeRoomId, language } = useStore();
  const t = getTranslation(language);
  const roomFurnCount = furniture.filter((f) => f.roomId === activeRoomId).length;

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-sidebar'));
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  const openBatchQR = () => {
    window.dispatchEvent(new CustomEvent('open-batch-qr', { detail: activeRoomId }));
  };

  const openWelcome = () => {
    window.dispatchEvent(new CustomEvent('open-welcome'));
  };

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-30 pointer-events-none">
      <nav
        aria-label="Mobile Navigation"
        className="bg-[#fdfcf9]/95 backdrop-blur-md border border-[#e5e1d8] rounded-2xl shadow-xl px-2 py-1.5 flex items-center justify-around pointer-events-auto text-[#4a4a38]"
      >
        {/* Catalog / Sidebar Button */}
        <button
          onClick={openSidebar}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium hover:bg-[#f1eee6] active:scale-95 transition-all text-[#4a4a38] min-w-[56px] min-h-[44px]"
        >
          <div className="relative">
            <Menu size={18} />
            {roomFurnCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#8a9a5b] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {roomFurnCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-semibold">{t.mobileBottomBar.rooms}</span>
        </button>

        {/* Search Button */}
        <button
          onClick={openSearch}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium hover:bg-[#f1eee6] active:scale-95 transition-all text-[#4a4a38] min-w-[56px] min-h-[44px]"
        >
          <Search size={18} />
          <span className="text-[10px] mt-0.5 font-semibold">{t.mobileBottomBar.search}</span>
        </button>

        {/* QR Stickers Button */}
        <button
          onClick={openBatchQR}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium hover:bg-[#f1eee6] active:scale-95 transition-all text-[#7a8c4b] min-w-[56px] min-h-[44px]"
        >
          <QrCode size={18} />
          <span className="text-[10px] mt-0.5 font-semibold">{t.mobileBottomBar.qrLabels}</span>
        </button>

        {/* Guide / Demo */}
        <button
          onClick={openWelcome}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium hover:bg-[#f1eee6] active:scale-95 transition-all text-[#8a8678] min-w-[56px] min-h-[44px]"
        >
          <Sparkles size={18} className="text-[#8a9a5b]" />
          <span className="text-[10px] mt-0.5 font-semibold">{t.mobileBottomBar.guide}</span>
        </button>
      </nav>
    </div>
  );
}

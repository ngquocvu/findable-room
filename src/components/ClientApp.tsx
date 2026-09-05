"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SceneContainer } from './3d/SceneContainer';
import { SearchModal } from './SearchModal';
import { FurnitureContentsModal } from './FurnitureContentsModal';
import { WelcomeModal } from './WelcomeModal';
import { QRLabelModal } from './QRLabelModal';
import { MobileScanViewModal } from './MobileScanViewModal';
import { MobileBottomBar } from './MobileBottomBar';
import { ImageToRoomModal } from './ImageToRoomModal';
import { VoiceItemsModal } from './VoiceItemsModal';
import { BrowserAgentBar } from './BrowserAgentBar';
import { AILabsSettingsModal } from './AILabsSettingsModal';
import { useStore } from '@/src/store/useStore';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';
import { v4 as uuidv4 } from 'uuid';

export function ClientApp() {
  const { rooms, addRoom, setActiveRoom, language } = useStore();
  const { detectBrowserAI } = useFeatureFlags();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync document language attribute with active language state
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  useEffect(() => {
    detectBrowserAI();
  }, []);

  useEffect(() => {
    setMounted(true);
    // If no room exists and user already dismissed welcome modal, create default
    const hasSeenWelcome = localStorage.getItem('roomfindable_welcomed');
    if (rooms.length === 0 && hasSeenWelcome) {
      const defaultRoom = {
        id: uuidv4(),
        name: language === 'vi' ? 'Phòng đầu tiên của tôi' : 'My First Room',
        width: 5,
        depth: 5,
        height: 2.8,
        floorColor: '#c8b99a',
        wallColor: '#d4cfc7',
      };
      addRoom(defaultRoom);
      setActiveRoom(defaultRoom.id);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#fdfcf9] text-[#4a4a38] overflow-hidden font-sans">
      {/* WCAG 2.1 Level A 2.4.1 Bypass Blocks - Skip to Content */}
      <a
        href="#main-canvas"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#8a9a5b] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold focus:outline-none"
      >
        {language === 'vi' ? 'Chuyển thẳng tới không gian 3D' : 'Skip to 3D room canvas'}
      </a>

      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <TopBar />
        <main
          id="main-canvas"
          tabIndex={-1}
          aria-label={language === 'vi' ? 'Không gian 3D phòng' : '3D Room Scene'}
          className="flex-1 relative w-full h-full overflow-hidden focus:outline-none"
        >
          <SceneContainer />
        </main>
      </div>
      <SearchModal />
      <FurnitureContentsModal />
      <WelcomeModal />
      <QRLabelModal />
      <MobileScanViewModal />
      <MobileBottomBar />
      {/* AI Feature Modals */}
      <ImageToRoomModal />
      <VoiceItemsModal />
      <BrowserAgentBar />
      <AILabsSettingsModal />
    </div>
  );
}

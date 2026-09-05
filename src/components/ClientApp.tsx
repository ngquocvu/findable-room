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
import { useStore } from '@/src/store/useStore';
import { v4 as uuidv4 } from 'uuid';

export function ClientApp() {
  const { rooms, addRoom, setActiveRoom, language } = useStore();
  const [mounted, setMounted] = useState(false);

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
    <div className="flex h-screen w-full bg-[#fdfcf9] text-[#4a4a38] overflow-hidden font-sans select-none">
       <Sidebar />
       <div className="flex-1 flex flex-col relative overflow-hidden">
          <TopBar />
          <div className="flex-1 relative w-full h-full overflow-hidden">
             <SceneContainer />
          </div>
       </div>
       <SearchModal />
       <FurnitureContentsModal />
       <WelcomeModal />
       <QRLabelModal />
       <MobileScanViewModal />
       <MobileBottomBar />
    </div>
  );
}

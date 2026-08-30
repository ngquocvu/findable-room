"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SceneContainer } from './3d/SceneContainer';
import { SearchModal } from './SearchModal';
import { FurnitureContentsModal } from './FurnitureContentsModal';
import { useStore } from '@/src/store/useStore';
import { v4 as uuidv4 } from 'uuid';

export function ClientApp() {
  const { rooms, addRoom, setActiveRoom } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Create a default room if none exists
    if (rooms.length === 0) {
      const defaultRoom = {
        id: uuidv4(),
        name: 'My First Room',
        width: 5,
        depth: 5,
        height: 2.8,
        floorColor: '#8B7355',
        wallColor: '#a8b8c8',
      };
      addRoom(defaultRoom);
      setActiveRoom(defaultRoom.id);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#fdfcf9] text-[#4a4a38] overflow-hidden font-sans">
       <Sidebar />
       <div className="flex-1 flex flex-col relative">
          <TopBar />
          <div className="flex-1 relative">
             <SceneContainer />
          </div>
       </div>
       <SearchModal />
       <FurnitureContentsModal />
    </div>
  );
}

"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useStore } from '@/src/store/useStore';
import { RoomScene } from './RoomScene';

export function SceneContainer() {
  const { activeRoomId } = useStore();
  
  return (
    <div className="w-full h-full bg-[#f1efe9]">
      <Canvas camera={{ position: [8, 6, 8], fov: 45 }} shadows>
        <color attach="background" args={['#e9e6dc']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 15, 10]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {activeRoomId ? (
          <RoomScene roomId={activeRoomId} />
        ) : (
          <Grid infiniteGrid fadeDistance={20} sectionColor="#c4beaf" cellColor="#d8d3c5" />
        )}
        
        <OrbitControls makeDefault minDistance={2} maxDistance={20} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}

"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '@/src/store/useStore';
import { RoomScene } from './RoomScene';
import { DragController } from './DragController';
import { useRef } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function SceneContainer() {
  const { activeRoomId } = useStore();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div className="w-full h-full bg-[#f5f3ee]">
      <Canvas
        camera={{ position: [8, 10, 8], fov: 45 }}
        shadows
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        {/* Warm ambient sky */}
        <color attach="background" args={['#e8e4dc']} />

        {/* Warm daylight lighting */}
        <ambientLight color="#f5f0e8" intensity={1.5} />
        <directionalLight
          position={[8, 12, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <hemisphereLight args={['#d4ccc0', '#a89880', 0.6]} />

        {activeRoomId ? (
          <RoomScene roomId={activeRoomId} />
        ) : (
          <group>
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#d8d3c5" roughness={0.9} />
            </mesh>
          </group>
        )}

        <DragController />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={3}
          maxDistance={25}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}

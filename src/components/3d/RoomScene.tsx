import { useStore } from '@/src/store/useStore';
import { FurnitureModel } from './FurnitureModel';
import * as THREE from 'three';
import { useMemo } from 'react';

// Warm light palette edge colors
const WALL_EDGE_COLOR = '#b8b0a0';

interface WallProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  transparent?: boolean;
}

function Wall({ position, size, color, transparent = false }: WallProps) {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]);
  return (
    <group position={position}>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={transparent ? 0.1 : 0.25}
          roughness={0.8}
          flatShading
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geo]} />
        <lineBasicMaterial color={WALL_EDGE_COLOR} />
      </lineSegments>
    </group>
  );
}

interface FloorGridProps {
  width: number;
  depth: number;
}

function FloorGrid({ width, depth }: FloorGridProps) {
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = 0; x <= width; x += 0.5) {
      pts.push(new THREE.Vector3(x - width / 2, 0.01, -depth / 2));
      pts.push(new THREE.Vector3(x - width / 2, 0.01, depth / 2));
    }
    for (let z = 0; z <= depth; z += 0.5) {
      pts.push(new THREE.Vector3(-width / 2, 0.01, z - depth / 2));
      pts.push(new THREE.Vector3(width / 2, 0.01, z - depth / 2));
    }
    return pts;
  }, [width, depth]);

  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(lines), [lines]);

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#c8c0b0" transparent opacity={0.5} />
    </lineSegments>
  );
}

function CornerPillars({ width, depth, height }: { width: number; depth: number; height: number }) {
  const corners: [number, number, number][] = [
    [-width / 2, height / 2, -depth / 2],
    [width / 2, height / 2, -depth / 2],
    [width / 2, height / 2, depth / 2],
    [-width / 2, height / 2, depth / 2],
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.1, height, 0.1]} />
          <meshStandardMaterial color={WALL_EDGE_COLOR} flatShading />
        </mesh>
      ))}
    </>
  );
}

export function RoomScene({ roomId }: { roomId: string }) {
  const { rooms, furniture, items } = useStore();
  const room = rooms.find(r => r.id === roomId);
  const roomFurniture = furniture.filter(f => f.roomId === roomId);

  if (!room) return null;

  const { width, depth, height, floorColor, wallColor } = room;
  const hw = width / 2;
  const hd = depth / 2;

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} metalness={0.0} flatShading />
      </mesh>

      {/* Floor grid */}
      <FloorGrid width={width} depth={depth} />

      {/* Walls: back (solid), left (solid), right (transparent), front (transparent) */}
      <Wall position={[0, height / 2, -hd - 0.04]} size={[width, height, 0.08]} color={wallColor} />
      <Wall position={[-hw - 0.04, height / 2, 0]} size={[0.08, height, depth]} color={wallColor} />
      <Wall position={[hw + 0.04, height / 2, 0]} size={[0.08, height, depth]} color={wallColor} transparent />
      <Wall position={[0, height / 2, hd + 0.04]} size={[width, height, 0.08]} color={wallColor} transparent />

      {/* Corner pillars */}
      <CornerPillars width={width} depth={depth} height={height} />

      {/* Floor border line */}
      <line>
        <bufferGeometry setFromPoints={[
          new THREE.Vector3(-hw, 0.02, -hd),
          new THREE.Vector3(hw, 0.02, -hd),
          new THREE.Vector3(hw, 0.02, hd),
          new THREE.Vector3(-hw, 0.02, hd),
          new THREE.Vector3(-hw, 0.02, -hd),
        ]} />
        <lineBasicMaterial color={WALL_EDGE_COLOR} />
      </line>

      {/* Furniture */}
      {roomFurniture.map(f => {
        const itemCount = items.filter(i => i.furnitureId === f.id).length;
        return <FurnitureModel key={f.id} furniture={f} itemCount={itemCount} />;
      })}
    </group>
  );
}

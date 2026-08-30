import { useStore } from '@/src/store/useStore';
import { FurnitureModel } from './FurnitureModel';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

export function RoomScene({ roomId }: { roomId: string }) {
  const { rooms, furniture } = useStore();
  const room = rooms.find(r => r.id === roomId);
  const roomFurniture = furniture.filter(f => f.roomId === roomId);

  if (!room) return null;

  return (
    <group>
      {/* Floor */}
      <Box args={[room.width, 0.1, room.depth]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color={room.floorColor} />
      </Box>
      
      {/* Back Wall (Z = -depth/2) */}
      <Box args={[room.width, room.height, 0.2]} position={[0, room.height / 2, -room.depth / 2 - 0.1]} receiveShadow>
        <meshStandardMaterial color={room.wallColor} />
      </Box>
      
      {/* Left Wall (X = -width/2) */}
      <Box args={[0.2, room.height, room.depth]} position={[-room.width / 2 - 0.1, room.height / 2, 0]} receiveShadow>
        <meshStandardMaterial color={room.wallColor} />
      </Box>
      
      {/* Grid on the floor for guidance */}
      <gridHelper 
        args={[Math.max(room.width, room.depth), Math.max(room.width, room.depth), '#334155', '#1e293b']} 
        position={[0, 0.01, 0]} 
      />

      {roomFurniture.map(f => (
        <FurnitureModel key={f.id} furniture={f} />
      ))}
    </group>
  );
}

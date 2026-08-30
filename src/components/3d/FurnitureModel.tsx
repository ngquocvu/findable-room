import { useStore } from '@/src/store/useStore';
import { Box, Edges } from '@react-three/drei';
import { Furniture } from '@/src/types';
import { ThreeEvent } from '@react-three/fiber';

export function FurnitureModel({ furniture }: { furniture: Furniture }) {
  const { activeFurnitureId, setActiveFurniture } = useStore();
  const isActive = activeFurnitureId === furniture.id;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveFurniture(furniture.id);
  };

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-furniture', { detail: furniture.id }));
  };

  // Adjust Y position so the origin is at the bottom of the furniture
  const [x, y, z] = furniture.position;
  const [w, h, d] = furniture.dimensions;
  
  return (
    <Box 
      args={furniture.dimensions} 
      position={[x, y + h / 2, z]} 
      rotation={furniture.rotation}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={furniture.color} opacity={isActive ? 0.9 : 1} transparent />
      {isActive && <Edges color="white" scale={1.05} />}
      <Edges color="black" scale={1} threshold={15} />
    </Box>
  );
}

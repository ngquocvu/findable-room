"use client";
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useStore } from '@/src/store/useStore';
import { GRID_SNAP } from '@/src/lib/furniturePresets';
import { dragState } from '@/src/lib/dragState';
import * as THREE from 'three';

function snapToGrid(value: number, grid: number): number {
  return Math.round(value / grid) * grid;
}

export function DragController() {
  const { camera, gl } = useThree();
  const { rooms, furniture, activeRoomId, updateFurniture } = useStore();

  // Keep latest store values accessible in event handlers without re-registration
  const storeRef = useRef({ rooms, furniture, activeRoomId, updateFurniture });
  useFrame(() => {
    storeRef.current = { rooms, furniture, activeRoomId, updateFurniture };
  });

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectPoint = useRef(new THREE.Vector3());
  const footprintRef = useRef<THREE.Mesh>(null);
  const isValidDrop = useRef(true);
  const mouseMoved = useRef(false);

  const getNDC = (e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const checkCollision = (
    furnitureId: string, w: number, d: number, nx: number, nz: number
  ): boolean => {
    const { rooms, furniture, activeRoomId } = storeRef.current;
    const room = rooms.find(r => r.id === activeRoomId);
    if (!room) return false;
    for (const other of furniture.filter(f => f.roomId === activeRoomId)) {
      if (other.id === furnitureId) continue;
      const [ow, , od] = other.dimensions;
      const [ox, , oz] = other.position;
      if (Math.abs(nx - ox) < (w + ow) / 2 && Math.abs(nz - oz) < (d + od) / 2) return true;
    }
    return false;
  };

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // dragState.active + dragState.furnitureId is set by FurnitureModel's onPointerDown.
      // If a furniture was just grabbed, record originalPosition here.
      if (!dragState.active || !dragState.furnitureId) return;

      mouseMoved.current = false;
      getNDC(e);
      raycaster.current.setFromCamera(mouse.current, camera);
      raycaster.current.ray.intersectPlane(dragPlane.current, intersectPoint.current);

      const furn = storeRef.current.furniture.find(f => f.id === dragState.furnitureId);
      if (furn) {
        dragState.originalPosition = [...furn.position] as [number, number, number];
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.active || !dragState.furnitureId) return;
      mouseMoved.current = true;
      getNDC(e);

      raycaster.current.setFromCamera(mouse.current, camera);
      const hit = raycaster.current.ray.intersectPlane(dragPlane.current, intersectPoint.current);
      if (!hit) return;

      const { furniture, activeRoomId, rooms, updateFurniture } = storeRef.current;
      const furn = furniture.find(f => f.id === dragState.furnitureId);
      const room = rooms.find(r => r.id === activeRoomId);
      if (!furn || !room) return;

      const [w, , d] = furn.dimensions;

      // Snap + clamp to room
      let nx = snapToGrid(intersectPoint.current.x, GRID_SNAP);
      let nz = snapToGrid(intersectPoint.current.z, GRID_SNAP);
      nx = Math.max(-room.width / 2 + w / 2, Math.min(room.width / 2 - w / 2, nx));
      nz = Math.max(-room.depth / 2 + d / 2, Math.min(room.depth / 2 - d / 2, nz));

      const collision = checkCollision(furn.id, w, d, nx, nz);
      isValidDrop.current = !collision;

      // Show footprint
      if (footprintRef.current) {
        footprintRef.current.position.set(nx, 0.025, nz);
        footprintRef.current.scale.set(w, d, 1);
        (footprintRef.current.material as THREE.MeshBasicMaterial).color.setHex(
          isValidDrop.current ? 0x57cc99 : 0xe63946
        );
        footprintRef.current.visible = true;
      }

      // Live update for smooth feedback
      updateFurniture(furn.id, { position: [nx, 0, nz] });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (!dragState.active || !dragState.furnitureId) return;

      if (footprintRef.current) footprintRef.current.visible = false;

      // Snap back if invalid drop
      if (!isValidDrop.current && mouseMoved.current) {
        storeRef.current.updateFurniture(dragState.furnitureId, {
          position: dragState.originalPosition,
        });
      }

      dragState.active = false;
      dragState.furnitureId = null;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, camera]);

  return (
    <>
      {/* Footprint plane — shows valid/invalid drop zone during drag */}
      <mesh ref={footprintRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={0x57cc99} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

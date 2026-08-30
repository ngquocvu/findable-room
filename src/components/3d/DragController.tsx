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
  const { camera, gl, controls } = useThree();
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
    furnitureId: string, effectiveW: number, effectiveD: number, nx: number, nz: number
  ): boolean => {
    const { rooms, furniture, activeRoomId } = storeRef.current;
    const room = rooms.find(r => r.id === activeRoomId);
    if (!room) return false;
    for (const other of furniture.filter(f => f.roomId === activeRoomId)) {
      if (other.id === furnitureId) continue;
      const [ow, , od] = other.dimensions;
      const oAngle = other.rotation?.[1] || 0;
      const oCos = Math.abs(Math.cos(oAngle));
      const oSin = Math.abs(Math.sin(oAngle));
      const oEffW = ow * oCos + od * oSin;
      const oEffD = ow * oSin + od * oCos;
      const [ox, , oz] = other.position;
      if (Math.abs(nx - ox) < (effectiveW + oEffW) / 2 && Math.abs(nz - oz) < (effectiveD + oEffD) / 2) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.active || !dragState.furnitureId) return;

      // Ensure OrbitControls doesn't rotate camera while dragging
      if (controls) {
        (controls as any).enabled = false;
      }
      document.body.style.cursor = 'grabbing';
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
      const angle = furn.rotation?.[1] || 0;
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      const effectiveW = w * cos + d * sin;
      const effectiveD = w * sin + d * cos;

      // Snap + clamp to room bounds accounting for rotation
      let nx = snapToGrid(intersectPoint.current.x, GRID_SNAP);
      let nz = snapToGrid(intersectPoint.current.z, GRID_SNAP);
      nx = Math.max(-room.width / 2 + effectiveW / 2, Math.min(room.width / 2 - effectiveW / 2, nx));
      nz = Math.max(-room.depth / 2 + effectiveD / 2, Math.min(room.depth / 2 - effectiveD / 2, nz));

      const collision = checkCollision(furn.id, effectiveW, effectiveD, nx, nz);
      isValidDrop.current = !collision;

      // Show footprint guide on the floor
      if (footprintRef.current) {
        footprintRef.current.position.set(nx, 0.025, nz);
        footprintRef.current.rotation.set(-Math.PI / 2, 0, furn.rotation?.[1] || 0);
        footprintRef.current.scale.set(w, d, 1);
        (footprintRef.current.material as THREE.MeshBasicMaterial).color.setHex(
          isValidDrop.current ? 0x57cc99 : 0xe63946
        );
        footprintRef.current.visible = true;
      }

      // Live update for immediate feedback
      updateFurniture(furn.id, { position: [nx, 0, nz] });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragState.active && !dragState.furnitureId) return;

      if (footprintRef.current) footprintRef.current.visible = false;

      // Snap back if dropped on an invalid spot (collision)
      if (!isValidDrop.current && mouseMoved.current && dragState.furnitureId) {
        storeRef.current.updateFurniture(dragState.furnitureId, {
          position: dragState.originalPosition,
        });
      }

      dragState.active = false;
      dragState.furnitureId = null;
      mouseMoved.current = false;
      document.body.style.cursor = 'default';

      // Re-enable OrbitControls after drag finishes
      if (controls) {
        (controls as any).enabled = true;
      }
    };

    const onPointerCancel = () => {
      if (dragState.active && dragState.furnitureId) {
        if (footprintRef.current) footprintRef.current.visible = false;
        storeRef.current.updateFurniture(dragState.furnitureId, {
          position: dragState.originalPosition,
        });
        dragState.active = false;
        dragState.furnitureId = null;
        mouseMoved.current = false;
        document.body.style.cursor = 'default';
        if (controls) {
          (controls as any).enabled = true;
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', onPointerCancel);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('blur', onPointerCancel);
    };
  }, [gl, camera, controls]);

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

"use client";
import { useRef, useMemo } from 'react';
import { useStore } from '@/src/store/useStore';
import { Furniture } from '@/src/types';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { dragState } from '@/src/lib/dragState';
import * as THREE from 'three';

// ── Color helpers ────────────────────────────────────────
function darken(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  hsl.l = Math.max(0, hsl.l - amount);
  c.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + c.getHexString();
}
function lighten(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  hsl.l = Math.min(1, hsl.l + amount);
  c.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + c.getHexString();
}

// ── Reusable mesh pieces ────────────────────────────────
interface BoxPartProps {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  edges?: boolean;
  edgeColor?: string;
}
function BoxPart({ size, position, color, edges = true, edgeColor = '#000000' }: BoxPartProps) {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]);
  return (
    <group position={position}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} flatShading />
      </mesh>
      {edges && (
        <lineSegments>
          <edgesGeometry args={[geo]} />
          <lineBasicMaterial color={edgeColor} transparent opacity={0.18} />
        </lineSegments>
      )}
    </group>
  );
}

// ── Per-type geometry builders ───────────────────────────

function Wardrobe({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  return (
    <group>
      <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />
      {/* Door divider line */}
      <BoxPart size={[0.02, h * 0.85, 0.015]} position={[0, h / 2, d / 2 + 0.01]} color="#00000055" edges={false} />
      {/* Handles */}
      <BoxPart size={[0.04, 0.12, 0.04]} position={[-w * 0.15, h * 0.5, d / 2 + 0.03]} color="#ccaa44" edges={false} />
      <BoxPart size={[0.04, 0.12, 0.04]} position={[w * 0.15, h * 0.5, d / 2 + 0.03]} color="#ccaa44" edges={false} />
      {/* Crown strip */}
      <BoxPart size={[w + 0.04, 0.06, d + 0.04]} position={[0, h + 0.03, 0]} color={darken(color, 0.15)} />
    </group>
  );
}

function Cabinet({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  return (
    <group>
      <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />
      {/* Internal shelves */}
      <BoxPart size={[w * 0.9, 0.03, d * 0.9]} position={[0, h / 3, 0]} color={darken(color, 0.1)} />
      <BoxPart size={[w * 0.9, 0.03, d * 0.9]} position={[0, (h * 2) / 3, 0]} color={darken(color, 0.1)} />
      {/* Handle */}
      <BoxPart size={[0.06, 0.06, 0.04]} position={[0, h * 0.5, d / 2 + 0.03]} color="#ccaa44" edges={false} />
    </group>
  );
}

function Closet({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  return (
    <group>
      <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />
      {/* Door panels */}
      <BoxPart size={[w * 0.46, h * 0.92, 0.03]} position={[-w * 0.24, h / 2, d / 2 + 0.02]} color={lighten(color, 0.05)} />
      <BoxPart size={[w * 0.46, h * 0.92, 0.03]} position={[w * 0.24, h / 2, d / 2 + 0.02]} color={lighten(color, 0.05)} />
      {/* Handles */}
      <BoxPart size={[0.04, 0.15, 0.04]} position={[-w * 0.04, h * 0.5, d / 2 + 0.05]} color="#ccaa44" edges={false} />
      <BoxPart size={[0.04, 0.15, 0.04]} position={[w * 0.04, h * 0.5, d / 2 + 0.05]} color="#ccaa44" edges={false} />
    </group>
  );
}

function Table({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const legW = 0.06;
  const topThick = 0.06;
  return (
    <group>
      {/* Tabletop */}
      <BoxPart size={[w, topThick, d]} position={[0, h, 0]} color={color} />
      {/* 4 Legs */}
      {([
        [-w / 2 + legW, h / 2, -d / 2 + legW],
        [w / 2 - legW, h / 2, -d / 2 + legW],
        [-w / 2 + legW, h / 2, d / 2 - legW],
        [w / 2 - legW, h / 2, d / 2 - legW],
      ] as [number, number, number][]).map((pos, i) => (
        <BoxPart key={i} size={[legW, h, legW]} position={pos} color={darken(color, 0.15)} />
      ))}
    </group>
  );
}

function Desk({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const topThick = 0.05;
  const drawerH = 0.15;
  return (
    <group>
      {/* Tabletop */}
      <BoxPart size={[w, topThick, d]} position={[0, h, 0]} color={color} />
      {/* Side panels */}
      <BoxPart size={[0.05, h, d]} position={[-w / 2 + 0.025, h / 2, 0]} color={darken(color, 0.1)} />
      <BoxPart size={[0.05, h, d]} position={[w / 2 - 0.025, h / 2, 0]} color={darken(color, 0.1)} />
      {/* Drawers */}
      <BoxPart size={[w * 0.4, drawerH, 0.03]} position={[w / 4, 0.15, d / 2 + 0.01]} color={lighten(color, 0.1)} />
      <BoxPart size={[0.08, 0.03, 0.03]} position={[w / 4, 0.15, d / 2 + 0.04]} color="#ccaa44" edges={false} />
      <BoxPart size={[w * 0.4, drawerH, 0.03]} position={[w / 4, 0.36, d / 2 + 0.01]} color={lighten(color, 0.1)} />
      <BoxPart size={[0.08, 0.03, 0.03]} position={[w / 4, 0.36, d / 2 + 0.04]} color="#ccaa44" edges={false} />
    </group>
  );
}

function Shelf({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const shelfCount = 4;
  const shelfThick = 0.04;
  const shelves = Array.from({ length: shelfCount + 1 }, (_, i) => (h / shelfCount) * i);
  return (
    <group>
      {/* Side panels */}
      <BoxPart size={[0.04, h, d]} position={[-w / 2 + 0.02, h / 2, 0]} color={darken(color, 0.1)} />
      <BoxPart size={[0.04, h, d]} position={[w / 2 - 0.02, h / 2, 0]} color={darken(color, 0.1)} />
      {/* Horizontal shelves */}
      {shelves.map((sy, i) => (
        <BoxPart key={i} size={[w, shelfThick, d]} position={[0, sy + shelfThick / 2, 0]} color={color} />
      ))}
      {/* Back panel */}
      <BoxPart size={[w, h, 0.02]} position={[0, h / 2, -d / 2 + 0.01]} color={darken(color, 0.2)} />
    </group>
  );
}

function DrawerUnit({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const drawerCount = 3;
  const drawerH = (h - 0.06) / drawerCount;
  const drawers = Array.from({ length: drawerCount }, (_, i) => 0.03 + drawerH / 2 + i * drawerH);
  return (
    <group>
      <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />
      {drawers.map((dy, i) => (
        <group key={i}>
          <BoxPart size={[w * 0.92, drawerH * 0.85, 0.03]} position={[0, dy, d / 2 + 0.01]} color={lighten(color, 0.08)} />
          <BoxPart size={[0.12, 0.03, 0.04]} position={[0, dy, d / 2 + 0.04]} color="#ccaa44" edges={false} />
        </group>
      ))}
    </group>
  );
}

function Box3D({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  return (
    <group>
      <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />
      {/* Lid */}
      <BoxPart size={[w + 0.02, 0.04, d + 0.02]} position={[0, h + 0.02, 0]} color={lighten(color, 0.15)} />
      {/* Label */}
      <BoxPart size={[w * 0.5, h * 0.3, 0.01]} position={[0, h * 0.6, d / 2 + 0.01]} color="#f5f0e0" edges={false} />
    </group>
  );
}

function Bed({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  return (
    <group>
      {/* Frame */}
      <BoxPart size={[w + 0.06, h * 0.3, d + 0.06]} position={[0, h * 0.15, 0]} color={darken(color, 0.3)} />
      {/* Mattress */}
      <BoxPart size={[w, h * 0.5, d]} position={[0, h * 0.5, 0]} color={color} />
      {/* Headboard */}
      <BoxPart size={[w + 0.06, h * 1.2, 0.08]} position={[0, h * 0.6, -d / 2 - 0.04]} color={darken(color, 0.3)} />
      {/* Pillow */}
      <BoxPart size={[w * 0.4, 0.08, 0.25]} position={[0, h * 0.8, -d * 0.35]} color="#e8e8e8" edges={false} />
    </group>
  );
}

function Fridge({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const freezerH = h * 0.3;
  return (
    <group>
      {/* Body */}
      <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />
      {/* Freezer door */}
      <BoxPart size={[w * 0.95, freezerH * 0.9, 0.03]} position={[0, h - freezerH / 2, d / 2 + 0.02]} color={lighten(color, 0.05)} />
      {/* Main door */}
      <BoxPart size={[w * 0.95, (h - freezerH) * 0.9, 0.03]} position={[0, (h - freezerH) / 2, d / 2 + 0.02]} color={lighten(color, 0.08)} />
      {/* Handles */}
      <BoxPart size={[0.04, 0.1, 0.04]} position={[w * 0.4, h - freezerH / 2, d / 2 + 0.05]} color="#aaaaaa" edges={false} />
      <BoxPart size={[0.04, 0.15, 0.04]} position={[w * 0.4, (h - freezerH) / 2, d / 2 + 0.05]} color="#aaaaaa" edges={false} />
      {/* Divider */}
      <BoxPart size={[w * 0.9, 0.02, 0.04]} position={[0, h - freezerH, d / 2 + 0.02]} color={darken(color, 0.15)} edges={false} />
    </group>
  );
}

// ── Badge sprite ─────────────────────────────────────────
function ItemBadge({ x, h, z, count }: { x: number; h: number; z: number; count: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, 256, 96);
    ctx.imageSmoothingEnabled = true;

    // Draw rounded pill badge (Sage/Olive matching app theme #6f7e45)
    const pillX = 16;
    const pillY = 16;
    const pillW = 224;
    const pillH = 64;
    const pillR = 32;

    ctx.beginPath();
    ctx.moveTo(pillX + pillR, pillY);
    ctx.lineTo(pillX + pillW - pillR, pillY);
    ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + pillR);
    ctx.lineTo(pillX + pillW, pillY + pillH - pillR);
    ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - pillR, pillY + pillH);
    ctx.lineTo(pillX + pillR, pillY + pillH);
    ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - pillR);
    ctx.lineTo(pillX, pillY + pillR);
    ctx.quadraticCurveTo(pillX, pillY, pillX + pillR, pillY);
    ctx.closePath();

    // Fill with sage green
    ctx.fillStyle = '#6f7e45';
    ctx.fill();

    // White border matching app badge styling
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Calculate dynamic centering for box icon + count text
    const text = `${count}`;
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const iconSize = 22;
    const gap = 12;
    const totalContentWidth = iconSize + gap + textWidth;
    const startX = (canvas.width - totalContentWidth) / 2;
    const centerY = pillY + pillH / 2;

    // Draw clean vector box icon (no emoji)
    const boxX = startX;
    const boxY = centerY - iconSize / 2;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(boxX, boxY, iconSize, iconSize);

    // Box lid line
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + 7);
    ctx.lineTo(boxX + iconSize, boxY + 7);
    ctx.stroke();

    // Box handle
    ctx.beginPath();
    ctx.moveTo(boxX + 7, boxY + 14);
    ctx.lineTo(boxX + iconSize - 7, boxY + 14);
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + iconSize + gap, centerY + 1);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [count]);

  return (
    <sprite position={[x, h + 0.42, z]} scale={[0.8, 0.3, 1]}>
      <spriteMaterial map={texture} transparent />
    </sprite>
  );
}

// ── Main component ───────────────────────────────────────
export function FurnitureModel({ furniture, itemCount = 0 }: { furniture: Furniture; itemCount?: number }) {
  const { controls } = useThree();
  const { activeFurnitureId, setActiveFurniture } = useStore();
  const isActive = activeFurnitureId === furniture.id;
  const groupRef = useRef<THREE.Group>(null);
  const emissiveRef = useRef(0);

  const [x, , z] = furniture.position;
  const [w, h, d] = furniture.dimensions;
  const color = furniture.color;

  // Hover pulse via useFrame
  useFrame(() => {
    if (!groupRef.current) return;
    if (isActive) {
      emissiveRef.current = 0.15 + Math.sin(Date.now() * 0.003) * 0.08;
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive.set('#f7d354');
          child.material.emissiveIntensity = emissiveRef.current;
        }
      });
    } else {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = 0;
        }
      });
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === 'mouse' || isActive) {
      e.stopPropagation();
      if (controls) {
        (controls as any).enabled = false;
      }
    }
    // Record start position for drag threshold detection
    dragState.active = true;
    dragState.isDragging = false;
    dragState.startPointerPos = { x: e.clientX, y: e.clientY };
    dragState.furnitureId = furniture.id;
    dragState.originalPosition = [...furniture.position] as [number, number, number];
    setActiveFurniture(furniture.id);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!dragState.isDragging) {
      setActiveFurniture(furniture.id);
      window.dispatchEvent(new CustomEvent('open-furniture', { detail: furniture.id }));
    }
  };

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveFurniture(furniture.id);
    window.dispatchEvent(new CustomEvent('open-furniture', { detail: furniture.id }));
  };

  const sharedProps = { w, h, d, color };

  const FurnitureShape = () => {
    switch (furniture.type) {
      case 'wardrobe': return <Wardrobe {...sharedProps} />;
      case 'cabinet':  return <Cabinet {...sharedProps} />;
      case 'closet':   return <Closet {...sharedProps} />;
      case 'table':    return <Table {...sharedProps} />;
      case 'desk':     return <Desk {...sharedProps} />;
      case 'shelf':    return <Shelf {...sharedProps} />;
      case 'drawer':   return <DrawerUnit {...sharedProps} />;
      case 'box':      return <Box3D {...sharedProps} />;
      case 'bed':      return <Bed {...sharedProps} />;
      case 'fridge':   return <Fridge {...sharedProps} />;
      default:         return <BoxPart size={[w, h, d]} position={[0, h / 2, 0]} color={color} />;
    }
  };

  return (
    <>
      <group
        ref={groupRef}
        position={[x, 0, z]}
        rotation={furniture.rotation}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!dragState.isDragging) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (!dragState.isDragging) {
            document.body.style.cursor = 'default';
          }
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <FurnitureShape />
      </group>
      {itemCount > 0 && <ItemBadge x={x} h={h} z={z} count={itemCount} />}
    </>
  );
}

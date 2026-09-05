import QRCode from 'qrcode';
import { Furniture, Room, StoredItem } from '../types';

export interface ContainerSnapshot {
  furnitureId: string;
  roomId: string;
  roomName: string;
  furnitureName: string;
  furnitureType: string;
  items: {
    id?: string;
    name: string;
    category: string;
    quantity: number;
    tags?: string[];
  }[];
  timestamp: number;
}

/**
 * Generate a QR code as a base64 Data URL
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 320,
    color: {
      dark: '#1e2019',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
    ...options,
  });
}

/**
 * Safe Unicode Base64 encoding
 */
function encodeSnapshot(snapshot: ContainerSnapshot): string {
  try {
    const json = JSON.stringify(snapshot);
    // encode UTF-8 properly into base64
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.warn('Failed to encode snapshot', err);
    return '';
  }
}

/**
 * Safe Unicode Base64 decoding
 */
export function decodeSnapshot(encoded: string): ContainerSnapshot | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as ContainerSnapshot;
  } catch (err) {
    console.warn('Failed to decode snapshot', err);
    return null;
  }
}

/**
 * Builds the shareable / scannable deep link URL for a furniture piece.
 * Includes both IDs for synced devices and an encoded snapshot payload
 * for standalone phone cameras with empty/fresh local storage.
 */
export function buildContainerDeepLink(
  furniture: Furniture,
  room: Room,
  items: StoredItem[]
): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://roomfindable.local';

  const snapshot: ContainerSnapshot = {
    furnitureId: furniture.id,
    roomId: room.id,
    roomName: room.name,
    furnitureName: furniture.name,
    furnitureType: furniture.type,
    items: items.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      tags: i.tags,
    })),
    timestamp: Date.now(),
  };

  const encodedData = encodeSnapshot(snapshot);
  
  // URL format: https://.../?room=roomId&furniture=furnitureId#data=encodedData
  return `${origin}/?room=${encodeURIComponent(room.id)}&furniture=${encodeURIComponent(furniture.id)}#box=${encodedData}`;
}

/**
 * Parses deep link parameters and snapshot from the current URL
 */
export function parseContainerDeepLink(): {
  furnitureId: string | null;
  roomId: string | null;
  snapshot: ContainerSnapshot | null;
} | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const furnitureId = urlParams.get('furniture') || urlParams.get('f');
  const roomId = urlParams.get('room') || urlParams.get('r');

  let snapshot: ContainerSnapshot | null = null;
  const hash = window.location.hash;
  if (hash.startsWith('#box=')) {
    const dataStr = hash.slice(5);
    snapshot = decodeSnapshot(dataStr);
  }

  if (!furnitureId && !snapshot) {
    return null;
  }

  return {
    furnitureId: furnitureId || snapshot?.furnitureId || null,
    roomId: roomId || snapshot?.roomId || null,
    snapshot,
  };
}

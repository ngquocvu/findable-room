import React from 'react';
import {
  Archive,
  DoorClosed,
  Table2,
  Monitor,
  Layers,
  Inbox,
  Box,
  Bed,
  Refrigerator,
  LucideProps,
} from 'lucide-react';
import { FurnitureType } from '@/src/types';

export const FURNITURE_ICON_MAP: Record<FurnitureType, React.ComponentType<LucideProps>> = {
  wardrobe: Archive,
  cabinet: Inbox,
  closet: DoorClosed,
  table: Table2,
  desk: Monitor,
  shelf: Layers,
  drawer: Inbox,
  box: Box,
  bed: Bed,
  fridge: Refrigerator,
};

interface FurnitureIconProps extends LucideProps {
  type?: FurnitureType | string;
}

export function FurnitureIcon({ type, ...props }: FurnitureIconProps) {
  const IconComponent = (type && FURNITURE_ICON_MAP[type as FurnitureType]) || Box;
  return <IconComponent {...props} />;
}

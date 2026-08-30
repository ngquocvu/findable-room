// ── Shared mutable drag state (module-level, no React re-render needed) ───
// Written by FurnitureModel on pointerdown, read by DragController on move/up.
export const dragState = {
  active: false,
  furnitureId: null as string | null,
  originalPosition: [0, 0, 0] as [number, number, number],
};

"use client";

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/src/store/useStore';
import { Furniture, Room, StoredItem } from '@/src/types';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { buildContainerDeepLink, generateQRCodeDataURL } from '@/src/lib/qrCode';
import { Printer, Download, Copy, Check, X, QrCode, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type LabelStyle = 'detailed' | 'standard' | 'compact';

interface LabelData {
  furniture: Furniture;
  room: Room;
  items: StoredItem[];
  qrDataUrl: string;
  deepLink: string;
}

export function QRLabelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetFurnitureId, setTargetFurnitureId] = useState<string | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [labelStyle, setLabelStyle] = useState<LabelStyle>('detailed');
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { rooms, furniture, items, activeRoomId } = useStore();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Listen for open events
  useEffect(() => {
    const handleOpenSingle = (e: Event) => {
      const furnId = (e as CustomEvent<string>).detail;
      if (furnId) {
        setTargetFurnitureId(furnId);
        setBatchMode(false);
        setIsOpen(true);
      }
    };

    const handleOpenBatch = (e: Event) => {
      const roomId = (e as CustomEvent<string | undefined>).detail || activeRoomId;
      setTargetRoomId(roomId || null);
      setBatchMode(true);
      setIsOpen(true);
    };

    window.addEventListener('open-qr-label', handleOpenSingle);
    window.addEventListener('open-batch-qr', handleOpenBatch);

    return () => {
      window.removeEventListener('open-qr-label', handleOpenSingle);
      window.removeEventListener('open-batch-qr', handleOpenBatch);
    };
  }, [activeRoomId]);

  // Generate QR codes for all selected targets
  useEffect(() => {
    if (!isOpen) return;

    let targets: Furniture[] = [];

    if (batchMode) {
      if (targetRoomId) {
        targets = furniture.filter(f => f.roomId === targetRoomId);
      } else {
        targets = furniture;
      }
    } else if (targetFurnitureId) {
      const furn = furniture.find(f => f.id === targetFurnitureId);
      if (furn) targets = [furn];
    }

    if (targets.length === 0) {
      setLabels([]);
      return;
    }

    setLoading(true);

    Promise.all(
      targets.map(async (f) => {
        const room = rooms.find(r => r.id === f.roomId) || {
          id: f.roomId,
          name: 'Room',
          width: 5,
          depth: 5,
          height: 3,
          floorColor: '#c8b99a',
          wallColor: '#d4cfc7',
        };
        const furnItems = items.filter(i => i.furnitureId === f.id);
        const deepLink = buildContainerDeepLink(f, room, furnItems);
        const qrDataUrl = await generateQRCodeDataURL(deepLink, {
          width: 280,
          margin: 1,
        });

        return {
          furniture: f,
          room,
          items: furnItems,
          qrDataUrl,
          deepLink,
        };
      })
    ).then((generated) => {
      setLabels(generated);
      setLoading(false);
    });
  }, [isOpen, batchMode, targetFurnitureId, targetRoomId, furniture, rooms, items]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (index: number, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadSinglePNG = (label: LabelData) => {
    const link = document.createElement('a');
    link.download = `QR-${label.furniture.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = label.qrDataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4a4a38]/40 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-4xl bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none print:w-full print:rounded-none"
        >
          {/* Header - Hidden in Print */}
          <div className="p-5 border-b border-[#e5e1d8] flex items-center justify-between bg-white shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f2f6ee] text-[#7a8c4b] border border-[#d6d1c2] rounded-xl flex items-center justify-center shadow-xs">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#4a4a38]" style={{ fontFamily: 'Georgia, serif' }}>
                  {batchMode ? 'Print Storage Stickers Sheet' : 'Print Container QR Sticker'}
                </h3>
                <p className="text-xs text-[#8a8678]">
                  Scan with your phone to immediately view & find stored items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#8a9a5b] hover:bg-[#7a8a4b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
              >
                <Printer size={15} /> Print Stickers
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-2 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Control Bar - Hidden in Print */}
          <div className="px-5 py-3 border-b border-[#e5e1d8] bg-[#f9f7f2] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
            {/* Style Selector */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#8a8678] uppercase text-[10px] tracking-wider flex items-center gap-1">
                <SlidersHorizontal size={11} /> Label Size:
              </span>
              {(['detailed', 'standard', 'compact'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setLabelStyle(style)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium capitalize transition-all ${
                    labelStyle === style
                      ? 'bg-white text-[#4a4a38] shadow-xs border border-[#d6d1c2] font-semibold'
                      : 'text-[#8a8678] hover:text-[#4a4a38]'
                  }`}
                >
                  {style === 'detailed' && 'Detailed List'}
                  {style === 'standard' && 'Standard Bin'}
                  {style === 'compact' && 'Compact Mini'}
                </button>
              ))}
            </div>

            {/* Scope / Summary */}
            <div className="text-[#8a8678] text-[11px] font-medium">
              {labels.length} sticker{labels.length === 1 ? '' : 's'} ready
            </div>
          </div>

          {/* Label Preview / Printable Area */}
          <div
            ref={printAreaRef}
            id="print-stickers-container"
            className="flex-1 overflow-y-auto p-6 bg-[#f5f3ee] print:p-0 print:bg-white print:overflow-visible"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-[#8a8678] gap-3">
                <div className="w-8 h-8 border-2 border-[#8a9a5b] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Generating high-res QR codes...</span>
              </div>
            ) : labels.length === 0 ? (
              <div className="text-center p-12 text-[#8a8678] text-sm">
                No furniture items found to print.
              </div>
            ) : (
              <div
                className={`grid gap-4 print:gap-3 ${
                  labelStyle === 'compact'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3'
                    : 'grid-cols-1 md:grid-cols-2 print:grid-cols-2'
                }`}
              >
                {labels.map((label, idx) => {
                  const preset = FURNITURE_PRESETS[label.furniture.type];
                  return (
                    <div
                      key={label.furniture.id}
                      className="bg-white border-2 border-dashed border-[#d6d1c2] rounded-2xl p-4 flex flex-col justify-between shadow-xs print:border-solid print:border-black print:rounded-lg print:break-inside-avoid print:shadow-none"
                      style={{ pageBreakInside: 'avoid' }}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center text-lg shrink-0 print:border print:border-black/20">
                            {preset?.icon ?? '📦'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#323223] leading-tight">
                              {label.furniture.name}
                            </h4>
                            <p className="text-[10px] text-[#8a8678] font-medium print:text-black">
                              📍 {label.room.name}
                            </p>
                          </div>
                        </div>

                        {/* Item count badge */}
                        <div className="px-2 py-0.5 bg-[#8a9a5b]/15 text-[#5e6c38] font-bold text-[10px] rounded-full shrink-0 print:border print:border-black print:text-black">
                          {label.items.length} item{label.items.length === 1 ? '' : 's'}
                        </div>
                      </div>

                      {/* Middle Body: QR code + Item preview */}
                      <div className="flex items-center gap-3 my-1">
                        {/* QR Code image */}
                        <div className="w-24 h-24 p-1 bg-white border border-[#e5e1d8] rounded-xl flex items-center justify-center shrink-0 shadow-2xs print:border-black/30 print:w-20 print:h-20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={label.qrDataUrl}
                            alt={`QR for ${label.furniture.name}`}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Content text preview */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          {labelStyle === 'detailed' && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a8678] print:text-black">
                                Stored Items:
                              </span>
                              {label.items.length === 0 ? (
                                <span className="text-[11px] text-[#a39f90] italic print:text-gray-600">
                                  Empty container
                                </span>
                              ) : (
                                <ul className="text-[11px] text-[#4a4a38] space-y-0.5 max-h-20 overflow-hidden print:text-black">
                                  {label.items.slice(0, 4).map((i) => (
                                    <li key={i.id} className="truncate flex items-center gap-1">
                                      <span className="text-[9px] text-[#8a9a5b] print:text-black">•</span>
                                      <span className="truncate">{i.name}</span>
                                      {i.quantity > 1 && (
                                        <span className="text-[9px] text-[#8a8678] font-semibold print:text-black">
                                          (×{i.quantity})
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                  {label.items.length > 4 && (
                                    <li className="text-[9px] text-[#8a8678] font-semibold print:text-black">
                                      + {label.items.length - 4} more items...
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          )}

                          {labelStyle === 'standard' && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-[#8a8678] print:text-black">
                                Scan with any phone camera to reveal full inventory & contents.
                              </span>
                              <span className="text-[9px] font-mono text-[#a39f90] uppercase mt-1 print:text-black">
                                Type: {label.furniture.type}
                              </span>
                            </div>
                          )}

                          {labelStyle === 'compact' && (
                            <div className="text-[10px] text-[#8a8678] leading-tight print:text-black">
                              Scan to inspect items
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer: Branding & Screen actions */}
                      <div className="mt-2 pt-2 border-t border-[#f1eee6] flex items-center justify-between text-[9px] text-[#a39f90] print:border-black/20 print:text-black">
                        <span className="font-semibold tracking-wider uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                          RoomFindable
                        </span>

                        {/* Interactive action buttons (hidden when printing) */}
                        <div className="flex items-center gap-1 print:hidden">
                          <button
                            onClick={() => handleCopyLink(idx, label.deepLink)}
                            title="Copy link"
                            className="p-1 text-[#8a8678] hover:text-[#4a4a38] hover:bg-[#f5f3ee] rounded transition-colors flex items-center gap-0.5"
                          >
                            {copiedIndex === idx ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                            <span className="text-[9px]">{copiedIndex === idx ? 'Copied' : 'Link'}</span>
                          </button>
                          <button
                            onClick={() => handleDownloadSinglePNG(label)}
                            title="Download PNG for label printer"
                            className="p-1 text-[#8a8678] hover:text-[#4a4a38] hover:bg-[#f5f3ee] rounded transition-colors flex items-center gap-0.5"
                          >
                            <Download size={11} />
                            <span className="text-[9px]">PNG</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Footer Helper Info - Hidden in Print */}
          <div className="p-4 bg-white border-t border-[#e5e1d8] flex items-center justify-between text-xs text-[#8a8678] shrink-0 print:hidden">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Sparkles size={13} className="text-[#8a9a5b]" />
              <span>
                Tip: Works with standard sticker paper (e.g. Avery sheets) or thermal Bluetooth label makers!
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8a9a5b] hover:bg-[#7a8a4b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer size={14} /> Print Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

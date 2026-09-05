"use client";

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/src/store/useStore';
import { Furniture, Room, StoredItem } from '@/src/types';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { buildContainerDeepLink, generateQRCodeDataURL } from '@/src/lib/qrCode';
import { Printer, Download, Copy, Check, X, QrCode, Sparkles, SlidersHorizontal, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '@/src/lib/translations';
import { FurnitureIcon } from '@/src/components/FurnitureIcon';
import { LogoIcon } from '@/src/components/Logo';

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

  const { rooms, furniture, items, activeRoomId, language } = useStore();
  const t = getTranslation(language);
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('open-qr-label', handleOpenSingle);
    window.addEventListener('open-batch-qr', handleOpenBatch);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-qr-label', handleOpenSingle);
      window.removeEventListener('open-batch-qr', handleOpenBatch);
      window.removeEventListener('keydown', handleKeyDown);
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
          name: language === 'vi' ? 'Phòng' : 'Room',
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
  }, [isOpen, batchMode, targetFurnitureId, targetRoomId, furniture, rooms, items, language]);

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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#4a4a38]/40 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-4xl bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none print:w-full print:rounded-none"
        >
          {/* Header - Hidden in Print */}
          <div className="p-3.5 sm:p-5 border-b border-[#e5e1d8] flex items-center justify-between bg-white shrink-0 print:hidden">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#f2f6ee] text-[#7a8c4b] border border-[#d6d1c2] rounded-xl flex items-center justify-center shadow-xs shrink-0" aria-hidden="true">
                <QrCode size={18} className="sm:size-5" />
              </div>
              <div>
                <h2 id="qr-modal-title" className="text-sm sm:text-base font-bold text-[#4a4a38] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {batchMode ? t.qrLabelModal.batchTitle : t.qrLabelModal.singleTitle}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8678] line-clamp-1">
                  {t.qrLabelModal.scanHelper}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrint}
                aria-label={t.qrLabelModal.printStickersBtn}
                className="px-3 sm:px-4 py-2 bg-[#8a9a5b] hover:bg-[#7a8a4b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
              >
                <Printer size={14} aria-hidden="true" />
                <span className="hidden sm:inline">{t.qrLabelModal.printStickersBtn}</span>
                <span className="sm:hidden">{t.common.print}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t.common.close}
                className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 sm:p-2 rounded-xl transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Control Bar - Hidden in Print */}
          <div className="px-5 py-3 border-b border-[#e5e1d8] bg-[#f9f7f2] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
            {/* Style Selector */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#8a8678] uppercase text-[10px] tracking-wider flex items-center gap-1">
                <SlidersHorizontal size={11} aria-hidden="true" /> {t.qrLabelModal.labelSize}
              </span>
              {(['detailed', 'standard', 'compact'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setLabelStyle(style)}
                  aria-pressed={labelStyle === style}
                  className={`px-2.5 py-1.5 rounded-lg font-medium capitalize transition-all ${
                    labelStyle === style
                      ? 'bg-white text-[#4a4a38] shadow-xs border border-[#d6d1c2] font-semibold'
                      : 'text-[#8a8678] hover:text-[#4a4a38]'
                  }`}
                >
                  {style === 'detailed' && t.qrLabelModal.styleDetailed}
                  {style === 'standard' && t.qrLabelModal.styleStandard}
                  {style === 'compact' && t.qrLabelModal.styleCompact}
                </button>
              ))}
            </div>

            {/* Scope / Summary */}
            <div className="text-[#8a8678] text-[11px] font-medium">
              {labels.length} {t.qrLabelModal.stickersReady}
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
                <span className="text-xs font-medium">
                  {language === 'vi' ? 'Đang tạo mã QR độ nét cao...' : 'Generating high-res QR codes...'}
                </span>
              </div>
            ) : labels.length === 0 ? (
              <div className="text-center p-12 text-[#8a8678] text-sm">
                {t.sidebar.noFurnitureInRoom}
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
                          <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0 print:border print:border-black/20">
                            <FurnitureIcon type={label.furniture.type} size={16} className="text-[#6f7e45] print:text-black" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#323223] leading-tight">
                              {label.furniture.name}
                            </h4>
                            <p className="text-[10px] text-[#8a8678] font-medium print:text-black flex items-center gap-1">
                              <MapPin size={10} className="text-[#8a9a5b] print:text-black shrink-0" aria-hidden="true" />
                              <span>{label.room.name}</span>
                            </p>
                          </div>
                        </div>

                        {/* Item count badge */}
                        <div className="px-2 py-0.5 bg-[#8a9a5b]/15 text-[#5e6c38] font-bold text-[10px] rounded-full shrink-0 print:border print:border-black print:text-black">
                          {label.items.length} {t.common.items.toLowerCase()}
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
                                {t.qrLabelModal.storedItemsLabel}
                              </span>
                              {label.items.length === 0 ? (
                                <span className="text-[11px] text-[#a39f90] italic print:text-gray-600">
                                  {t.qrLabelModal.emptyContainer}
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
                                      + {label.items.length - 4} {t.qrLabelModal.moreItems}
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          )}

                          {labelStyle === 'standard' && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-[#8a8678] print:text-black">
                                {t.qrLabelModal.scanWithPhone}
                              </span>
                              <span className="text-[9px] font-mono text-[#a39f90] uppercase mt-1 print:text-black">
                                {t.furniturePresets[label.furniture.type]?.label || label.furniture.type}
                              </span>
                            </div>
                          )}

                          {labelStyle === 'compact' && (
                            <div className="text-[10px] text-[#8a8678] leading-tight print:text-black">
                              {t.qrLabelModal.scanToInspect}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer: Branding & Screen actions */}
                      <div className="mt-2 pt-2 border-t border-[#f1eee6] flex items-center justify-between text-[9px] text-[#a39f90] print:border-black/20 print:text-black">
                        <span className="inline-flex items-center gap-1 font-semibold tracking-wider uppercase text-[#6f7e45] print:text-black" style={{ fontFamily: 'Georgia, serif' }}>
                          <LogoIcon size={12} />
                          RoomFindable
                        </span>

                        {/* Interactive action buttons (hidden when printing) */}
                        <div className="flex items-center gap-1 print:hidden">
                          <button
                            onClick={() => handleCopyLink(idx, label.deepLink)}
                            title={t.common.copied}
                            aria-label={`${t.common.link} - ${label.furniture.name}`}
                            className="p-1 text-[#8a8678] hover:text-[#4a4a38] hover:bg-[#f5f3ee] rounded transition-colors flex items-center gap-0.5"
                          >
                            {copiedIndex === idx ? <Check size={11} aria-hidden="true" className="text-green-600" /> : <Copy size={11} aria-hidden="true" />}
                            <span className="text-[9px]">{copiedIndex === idx ? t.common.copied : t.common.link}</span>
                          </button>
                          <button
                            onClick={() => handleDownloadSinglePNG(label)}
                            title="Download PNG"
                            aria-label={`Download PNG - ${label.furniture.name}`}
                            className="p-1 text-[#8a8678] hover:text-[#4a4a38] hover:bg-[#f5f3ee] rounded transition-colors flex items-center gap-0.5"
                          >
                            <Download size={11} aria-hidden="true" />
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
              <Sparkles size={13} aria-hidden="true" className="text-[#8a9a5b]" />
              <span>
                {t.qrLabelModal.printingTip}
              </span>
            </div>
            <button
              onClick={handlePrint}
              aria-label={t.qrLabelModal.printNow}
              className="px-4 py-2 bg-[#8a9a5b] hover:bg-[#7a8a4b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer size={14} aria-hidden="true" /> {t.qrLabelModal.printNow}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

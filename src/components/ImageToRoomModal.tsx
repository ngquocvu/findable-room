"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Camera, Upload, RotateCcw, CheckCircle2, AlertCircle,
  ChevronRight, Loader2, Info, KeyRound, Eye, EyeOff, ExternalLink, Check, Box
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/src/store/useStore';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';
import { getTranslation } from '@/src/lib/translations';
import { FURNITURE_PRESETS } from '@/src/lib/furniturePresets';
import { getManualApiKey, setManualApiKey as persistManualApiKey, hasAnyApiKey } from '@/src/lib/featureFlags';
import type { Furniture, Room } from '@/src/types';

type AnalysisStatus =
  | 'idle'
  | 'analyzing'
  | 'success'
  | 'empty_room'
  | 'not_a_room'
  | 'poor_lighting_or_quality'
  | 'too_close'
  | 'error';

interface AIFurnitureItem {
  name: string;
  type: string;
  dimensions: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}

interface AIRoom {
  name: string;
  width: number;
  depth: number;
  height: number;
  floorColor: string;
  wallColor: string;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface PreviewState {
  room: AIRoom;
  furniture: AIFurnitureItem[];
  selectedFurniture: Set<number>;
  roomName: string;
}

const ANALYZING_STEPS = [
  'analyzingStep1',
  'analyzingStep2',
  'analyzingStep3',
] as const;

const CONFIDENCE_COLORS = {
  high: 'text-[#4a572c] bg-[#f0f5ee] border-[#c8dbc8]',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-red-600 bg-red-50 border-red-200',
};

export function ImageToRoomModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inlineKey, setInlineKey] = useState('');
  const [showInlineKey, setShowInlineKey] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addRoom, addFurniture, setActiveRoom, language } = useStore();
  const { isEnabled, manualApiKey, setManualApiKey } = useFeatureFlags();
  const t = getTranslation(language);

  // Listen for the global open event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setInlineKey(getManualApiKey());
      setIsApiKeyError(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('open-image-to-room', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-image-to-room', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setImageFile(null);
    setImagePreview(null);
    setStatus('idle');
    setPreview(null);
    setErrorMessage('');
    setIsApiKeyError(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds 10MB limit.');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setStatus('idle');
    setPreview(null);
    setIsApiKeyError(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleSaveInlineKey = () => {
    if (inlineKey.trim()) {
      setManualApiKey(inlineKey.trim());
      setIsApiKeyError(false);
      setErrorMessage('');
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    // Save inline key if user entered one
    if (inlineKey.trim() && inlineKey.trim() !== manualApiKey) {
      setManualApiKey(inlineKey.trim());
    }

    setStatus('analyzing');
    setAnalyzingStep(0);
    setIsApiKeyError(false);
    setErrorMessage('');

    // Animate analysis steps
    const stepTimers = ANALYZING_STEPS.map((_, i) =>
      setTimeout(() => setAnalyzingStep(i), i * 900)
    );

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(',')[1]); // strip data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const keyToSend = inlineKey.trim() || manualApiKey || getManualApiKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (keyToSend) {
        headers['x-gemini-api-key'] = keyToSend;
      }

      const res = await fetch('/api/ai/image-to-room', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: imageFile.type,
        }),
      });

      stepTimers.forEach(clearTimeout);

      if (!res.ok) {
        const err = await res.json();
        const errText = err.error ?? 'Request failed';
        if (res.status === 401 || errText.toLowerCase().includes('api key') || errText.toLowerCase().includes('api_key')) {
          setIsApiKeyError(true);
        }
        throw new Error(errText);
      }

      const data = await res.json();

      if (data.status === 'not_a_room') {
        setStatus('not_a_room');
        setErrorMessage(t.imageToRoom.errorNotRoom);
        return;
      }
      if (data.status === 'poor_lighting_or_quality') {
        setStatus('poor_lighting_or_quality');
        setErrorMessage(t.imageToRoom.errorBlurry);
        return;
      }
      if (data.status === 'too_close') {
        setStatus('too_close');
        setErrorMessage(t.imageToRoom.errorTooClose);
        return;
      }

      const roomResult: AIRoom = data.room ?? {
        name: 'Scanned Room',
        width: 4.5,
        depth: 3.8,
        height: 2.8,
        floorColor: '#c8b99a',
        wallColor: '#d4cfc7',
        confidence: 'low',
        rationale: 'Default values applied',
      };

      setPreview({
        room: roomResult,
        furniture: data.furniture ?? [],
        selectedFurniture: new Set((data.furniture ?? []).map((_: any, i: number) => i)),
        roomName: roomResult.name,
      });
      setStatus(data.status === 'empty_room' ? 'empty_room' : 'success');
    } catch (err: any) {
      stepTimers.forEach(clearTimeout);
      console.error('[ImageToRoomModal]', err);
      setStatus('error');
      setErrorMessage(err.message ?? t.imageToRoom.errorGeneric);
    }
  };

  const handleCreateRoom = () => {
    if (!preview) return;
    const room: Room = {
      id: uuidv4(),
      name: preview.roomName || preview.room.name,
      width: preview.room.width,
      depth: preview.room.depth,
      height: preview.room.height,
      floorColor: preview.room.floorColor,
      wallColor: preview.room.wallColor,
    };
    addRoom(room);
    setActiveRoom(room.id);

    // Add selected furniture
    preview.furniture.forEach((f, i) => {
      if (!preview.selectedFurniture.has(i)) return;
      const preset = FURNITURE_PRESETS[f.type as keyof typeof FURNITURE_PRESETS];
      if (!preset) return;
      const furn: Furniture = {
        id: uuidv4(),
        roomId: room.id,
        name: f.name,
        type: preset.id,
        position: f.position,
        rotation: f.rotation,
        dimensions: f.dimensions,
        color: f.color,
      };
      addFurniture(furn);
    });

    handleClose();
  };

  const toggleFurnitureItem = (idx: number) => {
    if (!preview) return;
    const next = new Set(preview.selectedFurniture);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setPreview({ ...preview, selectedFurniture: next });
  };

  const confidenceLabel: Record<string, string> = {
    high: t.imageToRoom.confidenceHigh,
    medium: t.imageToRoom.confidenceMedium,
    low: t.imageToRoom.confidenceLow,
  };

  if (!isEnabled('aiImageToRoom')) return null;

  const keyIsConfigured = hasAnyApiKey() || !!inlineKey.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-to-room-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full sm:max-w-2xl bg-[#fdfcf9] border-t sm:border border-[#e5e1d8] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#4a4a38]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile pull handle */}
            <div className="sm:hidden w-10 h-1 bg-[#d6d1c2] rounded-full mx-auto mt-2.5 mb-1 shrink-0" aria-hidden="true" />

            {/* Header in Sage/Olive gradient matching WelcomeModal */}
            <div className="bg-gradient-to-r from-[#8a9a5b] to-[#a3b18a] text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                  <Camera size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 id="image-to-room-title" className="font-bold text-base sm:text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                    {t.imageToRoom.modalTitle}
                  </h2>
                  <p className="text-white/85 text-xs">{t.imageToRoom.modalSubtitle}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label={t.common.close}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Optional API Key banner if not configured yet */}
              {(!keyIsConfigured || isApiKeyError) && status !== 'analyzing' && (
                <div className="m-5 mb-0 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <KeyRound size={15} className="text-amber-700" />
                    <span>{t.imageToRoom.apiKeyPrompt}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showInlineKey ? 'text' : 'password'}
                        value={inlineKey}
                        onChange={(e) => setInlineKey(e.target.value)}
                        placeholder={t.aiLabs.apiKeyPlaceholder}
                        className="w-full bg-white border border-amber-300 focus:border-[#6f7e45] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none pr-9 text-[#4a4a38]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInlineKey(!showInlineKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a39f90] hover:text-[#4a4a38]"
                      >
                        {showInlineKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveInlineKey}
                      disabled={!inlineKey.trim()}
                      className="px-3.5 py-2 bg-[#6f7e45] hover:bg-[#5c693a] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shrink-0 transition-colors shadow-2xs"
                    >
                      <Check size={12} /> {t.aiLabs.apiKeySave}
                    </button>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-800 hover:text-amber-950 underline flex items-center gap-1 font-medium"
                  >
                    {t.aiLabs.apiKeyGetFree} <ExternalLink size={10} />
                  </a>
                </div>
              )}

              {/* === DROPZONE === */}
              {status === 'idle' && !imageFile && (
                <div className="p-5">
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#8a9a5b] bg-[#f0f5ee]'
                        : 'border-[#d6d1c2] hover:border-[#8a9a5b] hover:bg-[#faf9f5]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#f0f5ee] border border-[#d8e2cb] flex items-center justify-center">
                      <Upload size={26} className="text-[#6f7e45]" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                      <p className="text-[#4a4a38] font-semibold text-sm sm:text-base">{t.imageToRoom.dropzonePrompt}</p>
                      <p className="text-[#8a8678] text-xs mt-1">{t.imageToRoom.dropzoneHint}</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-hidden="true"
                    />
                  </label>
                </div>
              )}

              {/* === IMAGE SELECTED / PREVIEW === */}
              {imageFile && status === 'idle' && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="relative rounded-2xl overflow-hidden border border-[#e5e1d8] shadow-sm bg-black/5">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Room preview"
                        className="w-full h-56 object-cover"
                      />
                    )}
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl p-2 transition-colors backdrop-blur-xs"
                      aria-label={t.imageToRoom.retakeBtn}
                    >
                      <RotateCcw size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    className="w-full bg-[#6f7e45] hover:bg-[#5c693a] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Camera size={16} aria-hidden="true" />
                    {t.imageToRoom.analyzing.replace('...', '')} →
                  </button>
                </div>
              )}

              {/* === ANALYZING STATE === */}
              {status === 'analyzing' && (
                <div className="flex flex-col items-center justify-center gap-5 p-10 text-center">
                  {imagePreview && (
                    <div className="relative w-full max-h-40 rounded-2xl overflow-hidden opacity-60 border border-[#e5e1d8]">
                      <img src={imagePreview} alt="" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <Loader2 size={36} className="text-[#6f7e45] animate-spin" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#4a4a38] text-base">{t.imageToRoom.analyzing}</p>
                    <p className="text-xs text-[#8a8678] mt-1">
                      {t.imageToRoom[ANALYZING_STEPS[analyzingStep]]}
                    </p>
                  </div>
                  {/* Step indicators */}
                  <div className="flex gap-2">
                    {ANALYZING_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i <= analyzingStep ? 'bg-[#6f7e45] w-8' : 'bg-[#e5e1d8] w-4'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* === ERROR / REJECTION STATES === */}
              {['not_a_room', 'poor_lighting_or_quality', 'too_close', 'error'].includes(status) && (
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                    <AlertCircle size={28} className="text-red-500" aria-hidden="true" />
                  </div>
                  <p className="text-[#4a4a38] font-semibold max-w-sm leading-relaxed text-sm">{errorMessage}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setStatus('idle'); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#6f7e45] hover:bg-[#5c693a] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                    >
                      <RotateCcw size={14} aria-hidden="true" /> {t.voiceItems.retryBtn}
                    </button>
                    <button
                      onClick={() => { setStatus('idle'); setImageFile(null); setImagePreview(null); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#f1eee6] hover:bg-[#ece8df] rounded-xl text-xs sm:text-sm font-semibold text-[#4a4a38] transition-colors"
                    >
                      {t.imageToRoom.retakeBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* === EMPTY ROOM === */}
              {status === 'empty_room' && preview && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm">{t.imageToRoom.emptyRoomMsg}</p>
                      <p className="text-amber-800 text-xs mt-0.5">{t.imageToRoom.emptyRoomSub}</p>
                    </div>
                  </div>
                  <RoomDimensionPreview room={preview.room} t={t} onRoomChange={(r) => setPreview({ ...preview, room: r })} onNameChange={(name) => setPreview({ ...preview, roomName: name })} />
                </div>
              )}

              {/* === SUCCESS PREVIEW === */}
              {status === 'success' && preview && (
                <div className="p-5 flex flex-col gap-5">
                  {/* Room Dimensions */}
                  <section>
                    <h3 className="text-xs font-bold text-[#8a8678] uppercase tracking-wider mb-2">
                      {t.imageToRoom.roomDimensions}
                    </h3>
                    <RoomDimensionPreview
                      room={preview.room}
                      t={t}
                      onRoomChange={(r) => setPreview({ ...preview, room: r })}
                      onNameChange={(name) => setPreview({ ...preview, roomName: name })}
                    />
                  </section>

                  {/* Furniture list */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-[#8a8678] uppercase tracking-wider">
                        {t.imageToRoom.detectedFurniture} ({preview.furniture.length})
                      </h3>
                      {preview.furniture.length > 0 && (
                        <button
                          onClick={() => {
                            const all = preview.selectedFurniture.size === preview.furniture.length;
                            setPreview({
                              ...preview,
                              selectedFurniture: all ? new Set() : new Set(preview.furniture.map((_, i) => i)),
                            });
                          }}
                          className="text-xs text-[#6f7e45] hover:text-[#5c693a] font-semibold hover:underline"
                        >
                          {t.imageToRoom.furnitureToggleAll}
                        </button>
                      )}
                    </div>
                    {preview.furniture.length === 0 ? (
                      <p className="text-[#8a8678] text-sm text-center py-4">{t.imageToRoom.noFurnitureFound}</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {preview.furniture.map((f, i) => {
                          const preset = FURNITURE_PRESETS[f.type as keyof typeof FURNITURE_PRESETS];
                          const selected = preview.selectedFurniture.has(i);
                          return (
                            <button
                              key={i}
                              onClick={() => toggleFurnitureItem(i)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                selected
                                  ? 'border-[#8a9a5b] bg-[#f2f5ea] shadow-2xs'
                                  : 'border-[#e5e1d8] bg-white opacity-60 hover:opacity-100 hover:border-[#d6d1c2]'
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-lg shadow-2xs"
                                style={{ backgroundColor: f.color + '33' }}
                              >
                                <Box size={16} className="text-[#6f7e45]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#4a4a38] truncate">{f.name}</p>
                                <p className="text-xs text-[#8a8678]">
                                  {f.dimensions[0]}m × {f.dimensions[1]}m × {f.dimensions[2]}m
                                </p>
                              </div>
                              <div
                                className="w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors"
                                style={{
                                  borderColor: selected ? '#6f7e45' : '#d6d1c2',
                                  backgroundColor: selected ? '#6f7e45' : 'transparent',
                                }}
                              >
                                {selected && <CheckCircle2 size={13} className="text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {(status === 'success' || status === 'empty_room') && preview && (
              <div className="p-4 sm:p-5 border-t border-[#e5e1d8] bg-[#f9f7f2] flex gap-3 shrink-0 pb-6 sm:pb-4">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#d6d1c2] text-[#4a4a38] text-sm font-semibold hover:bg-[#f1eee6] transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="flex-[2] py-2.5 rounded-xl bg-[#6f7e45] hover:bg-[#5c693a] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                  {status === 'empty_room' ? t.imageToRoom.createEmptyRoomBtn : t.imageToRoom.createRoomBtn}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Sub-component: Room Dimension Preview with editable fields
function RoomDimensionPreview({
  room,
  t,
  onRoomChange,
  onNameChange,
}: {
  room: AIRoom;
  t: ReturnType<typeof getTranslation>;
  onRoomChange: (r: AIRoom) => void;
  onNameChange: (n: string) => void;
}) {
  const confClass = CONFIDENCE_COLORS[room.confidence] ?? CONFIDENCE_COLORS.low;

  return (
    <div className="bg-white border border-[#e5e1d8] rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
      {/* Room name */}
      <input
        type="text"
        defaultValue={room.name}
        placeholder={t.imageToRoom.newRoomNamePlaceholder}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-[#f9f7f2] border border-[#d6d1c2] rounded-xl px-3 py-2 text-sm text-[#4a4a38] focus:outline-none focus:border-[#6f7e45] font-semibold"
      />

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-2">
        {(['width', 'depth', 'height'] as const).map((dim) => {
          const dimLabels: Record<string, string> = {
            width: t.common.width,
            depth: t.common.depth,
            height: 'H (m)',
          };
          return (
            <label key={dim} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#8a8678] uppercase">{dimLabels[dim]}</span>
              <div className="flex items-center gap-1 bg-[#f9f7f2] border border-[#d6d1c2] rounded-lg px-2 py-1.5 focus-within:border-[#6f7e45]">
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={room[dim]}
                  onChange={(e) => onRoomChange({ ...room, [dim]: parseFloat(e.target.value) || room[dim] })}
                  className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-[#4a4a38] focus:outline-none text-center"
                />
                <span className="text-[10px] text-[#8a8678] shrink-0">m</span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Wall & Floor Colors */}
      <div className="flex gap-3">
        {(['wallColor', 'floorColor'] as const).map((key) => (
          <label key={key} className="flex items-center gap-2 text-xs text-[#4a4a38] cursor-pointer">
            <div
              className="w-7 h-7 rounded-lg border-2 border-[#d6d1c2] shadow-2xs"
              style={{ backgroundColor: room[key] }}
            />
            <span className="text-[#8a8678]">{t.common[key]}</span>
            <input
              type="color"
              value={room[key]}
              onChange={(e) => onRoomChange({ ...room, [key]: e.target.value })}
              className="sr-only"
              aria-label={t.common[key]}
            />
          </label>
        ))}
      </div>

      {/* Confidence */}
      <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-xl border ${confClass}`}>
        <Info size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold">{t.imageToRoom.confidence}: {confidenceLabel(room.confidence, t)} · </span>
          <span>{room.rationale}</span>
        </div>
      </div>
    </div>
  );
}

function confidenceLabel(conf: string, t: ReturnType<typeof getTranslation>): string {
  if (conf === 'high') return t.imageToRoom.confidenceHigh;
  if (conf === 'medium') return t.imageToRoom.confidenceMedium;
  return t.imageToRoom.confidenceLow;
}

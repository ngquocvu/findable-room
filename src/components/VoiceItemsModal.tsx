"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mic, MicOff, Loader2, RotateCcw, Check, AlertTriangle, Minus, Plus, Trash2, Tag, KeyRound, Eye, EyeOff,
  Shirt, FileText, Zap, Wrench, Book, Utensils, Gamepad2, Package
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/src/store/useStore';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';
import { getTranslation } from '@/src/lib/translations';
import { parseTranscriptWithBrowserAI } from '@/src/lib/browserAI';
import { getManualApiKey, hasAnyApiKey } from '@/src/lib/featureFlags';
import type { ItemCategory, StoredItem, Furniture } from '@/src/types';

const CATEGORY_ICONS: Record<ItemCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  clothing: Shirt,
  documents: FileText,
  electronics: Zap,
  tools: Wrench,
  books: Book,
  kitchenware: Utensils,
  toys: Gamepad2,
  misc: Package,
};

interface EditableItem {
  name: string;
  category: ItemCategory;
  quantity: number;
  tags: string[];
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'preview' | 'error';
type AddMode = 'add' | 'replace';

interface ModalData {
  furnitureId: string;
  furniture: Furniture;
}

export function VoiceItemsModal() {
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [mode, setMode] = useState<AddMode>('add');
  const [intentDetected, setIntentDetected] = useState<AddMode | null>(null);
  const [parsedItems, setParsedItems] = useState<EditableItem[]>([]);
  const [aiSource, setAiSource] = useState<'cloud' | 'browser'>('cloud');
  const [error, setError] = useState('');
  const [inlineKey, setInlineKey] = useState('');
  const [showInlineKey, setShowInlineKey] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);

  const recognitionRef = useRef<any>(null);
  const { furniture, items, addItem, replaceFurnitureItems, language } = useStore();
  const { isEnabled, aiProvider, browserAIAvailable, manualApiKey, setManualApiKey } = useFeatureFlags();
  const t = getTranslation(language);

  const furnitureItems = modalData
    ? items.filter((i) => i.furnitureId === modalData.furnitureId)
    : [];

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const furn = furniture.find((f) => f.id === id);
      if (id && furn) {
        setModalData({ furnitureId: id, furniture: furn });
        setVoiceState('idle');
        setTranscript('');
        setParsedItems([]);
        setMode('add');
        setIntentDetected(null);
        setError('');
        setIsApiKeyError(false);
        setInlineKey(getManualApiKey());
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('open-voice-items', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-voice-items', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [furniture]);

  const handleClose = useCallback(() => {
    recognitionRef.current?.stop();
    setModalData(null);
    setVoiceState('idle');
    setTranscript('');
    setParsedItems([]);
    setIsApiKeyError(false);
  }, []);

  const parseTranscript = useCallback(async (text: string) => {
    if (!text.trim() || !modalData) return;
    setVoiceState('processing');
    setError('');
    setIsApiKeyError(false);

    // Save inline key if user entered one
    if (inlineKey.trim() && inlineKey.trim() !== manualApiKey) {
      setManualApiKey(inlineKey.trim());
    }

    // Try browser AI first if available and provider allows
    if ((aiProvider === 'auto' || aiProvider === 'browser') && browserAIAvailable) {
      try {
        const result = await parseTranscriptWithBrowserAI(
          text,
          modalData.furniture.name,
          language
        );
        if (result && result.items.length > 0) {
          setAiSource('browser');
          setParsedItems(result.items);
          if (result.detectedIntent === 'replace') {
            setMode('replace');
            setIntentDetected('replace');
          }
          setVoiceState('preview');
          return;
        }
      } catch { /* fall through to cloud */ }
    }

    // Cloud fallback
    try {
      const keyToSend = inlineKey.trim() || manualApiKey || getManualApiKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (keyToSend) {
        headers['x-gemini-api-key'] = keyToSend;
      }

      const res = await fetch('/api/ai/voice-to-items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: text,
          furnitureName: modalData.furniture.name,
          furnitureType: modalData.furniture.type,
          language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        const errText = err.error ?? 'Parse failed';
        if (res.status === 401 || errText.toLowerCase().includes('api key') || errText.toLowerCase().includes('api_key')) {
          setIsApiKeyError(true);
        }
        throw new Error(errText);
      }

      const data = await res.json();
      setAiSource('cloud');
      setParsedItems(data.items ?? []);
      if (data.detectedIntent === 'replace') {
        setMode('replace');
        setIntentDetected('replace');
      }
      setVoiceState('preview');
    } catch (err: any) {
      setError(err.message ?? 'Failed to parse');
      setVoiceState('error');
    }
  }, [modalData, language, aiProvider, browserAIAvailable, inlineKey, manualApiKey, setManualApiKey]);

  const startListening = useCallback(() => {
    setError('');
    setTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please type your transcript below.');
      setVoiceState('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => setVoiceState('listening');
    recognition.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(' ');
      setTranscript(text);
    };
    recognition.onend = () => {
      if (transcript.trim()) {
        parseTranscript(transcript);
      } else {
        setVoiceState('idle');
      }
    };
    recognition.onerror = (e: any) => {
      setError(`Microphone error: ${e.error}`);
      setVoiceState('error');
    };

    recognition.start();
  }, [language, transcript, parseTranscript]);

  const handleConfirm = useCallback(() => {
    if (!modalData) return;
    const newItems: StoredItem[] = parsedItems.map((item) => ({
      id: uuidv4(),
      furnitureId: modalData.furnitureId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      tags: item.tags,
    }));

    if (mode === 'replace') {
      replaceFurnitureItems(modalData.furnitureId, newItems);
    } else {
      newItems.forEach((item) => addItem(item));
    }
    handleClose();
  }, [modalData, parsedItems, mode, addItem, replaceFurnitureItems, handleClose]);

  const updateItem = (idx: number, patch: Partial<EditableItem>) => {
    setParsedItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const removeItem = (idx: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const diffSummary = () => {
    const current = furnitureItems.length;
    const added = parsedItems.length;
    const next = mode === 'replace' ? added : current + added;
    if (mode === 'replace') {
      return t.voiceItems.diffReplaceSummary
        .replace('{{current}}', String(current))
        .replace('{{next}}', String(next));
    }
    return t.voiceItems.diffAddSummary
      .replace('{{current}}', String(current))
      .replace('{{next}}', String(next))
      .replace('{{added}}', String(added));
  };

  if (!isEnabled('aiVoiceToItems') || !modalData) return null;

  const furn = modalData.furniture;
  const keyIsConfigured = hasAnyApiKey() || !!inlineKey.trim();

  return (
    <AnimatePresence>
      {modalData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-items-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
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
            className="relative z-10 w-full sm:max-w-lg bg-[#fdfcf9] border-t sm:border border-[#e5e1d8] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#4a4a38]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile pull handle */}
            <div className="sm:hidden w-10 h-1 bg-[#d6d1c2] rounded-full mx-auto mt-2.5 mb-1 shrink-0" aria-hidden="true" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#e5e1d8] bg-white/95 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-[#f0f5ee] border border-[#d8e2cb] text-[#6f7e45] rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                  <Mic size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 id="voice-items-title" className="text-base font-bold text-[#4a4a38] truncate" style={{ fontFamily: 'Georgia, serif' }}>
                    {t.voiceItems.modalTitle}
                  </h2>
                  <p className="text-xs text-[#8a8678] truncate">{furn.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label={t.common.close}
                className="text-[#8a8678] hover:text-[#4a4a38] bg-[#f1eee6] hover:bg-[#ece8df] p-1.5 rounded-lg transition-colors shrink-0"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Optional API key banner if needed for cloud parsing */}
              {(!keyIsConfigured || isApiKeyError) && !browserAIAvailable && (
                <div className="mx-4 mt-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <KeyRound size={14} className="text-amber-700" />
                    <span>{t.voiceItems.apiKeyPrompt}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showInlineKey ? 'text' : 'password'}
                        value={inlineKey}
                        onChange={(e) => setInlineKey(e.target.value)}
                        placeholder={t.aiLabs.apiKeyPlaceholder}
                        className="w-full bg-white border border-amber-300 focus:border-[#6f7e45] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none pr-8 text-[#4a4a38]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowInlineKey(!showInlineKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a39f90] hover:text-[#4a4a38]"
                      >
                        {showInlineKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (inlineKey.trim()) setManualApiKey(inlineKey.trim()); setIsApiKeyError(false); }}
                      disabled={!inlineKey.trim()}
                      className="px-3 py-1.5 bg-[#6f7e45] hover:bg-[#5c693a] disabled:opacity-50 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
                    >
                      {t.aiLabs.apiKeySave}
                    </button>
                  </div>
                </div>
              )}

              {/* === ADD / REPLACE TOGGLE === */}
              <div className="px-4 pt-4 flex gap-2">
                {(['add', 'replace'] as AddMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      mode === m
                        ? m === 'replace'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-[#6f7e45] text-white shadow-2xs'
                        : 'bg-[#f1eee6] text-[#8a8678] hover:bg-[#ece8df]'
                    }`}
                  >
                    {m === 'add' ? (
                      <>
                        <Plus size={13} aria-hidden="true" />
                        <span>{t.voiceItems.addMode}</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={13} aria-hidden="true" />
                        <span>{t.voiceItems.replaceMode}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Replace warning */}
              {mode === 'replace' && furnitureItems.length > 0 && (
                <div className="mx-4 mt-2.5 flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                  <span>
                    {t.voiceItems.replaceWarning
                      .replace('{{count}}', String(furnitureItems.length))
                      .replace('{{name}}', furn.name)}
                  </span>
                </div>
              )}

              {/* Intent detected badge */}
              {intentDetected && (
                <div className="mx-4 mt-2 text-xs text-[#4a572c] bg-[#f0f5ee] border border-[#c8dbc8] rounded-xl px-3 py-2">
                  {t.voiceItems.intentDetected} <strong>{intentDetected === 'replace' ? t.voiceItems.replaceMode : t.voiceItems.addMode}</strong>
                </div>
              )}

              {/* === IDLE / RECORD STATE === */}
              {(voiceState === 'idle' || voiceState === 'listening' || voiceState === 'error') && (
                <div className="flex flex-col items-center gap-5 p-6">
                  <button
                    onClick={voiceState === 'listening' ? () => recognitionRef.current?.stop() : startListening}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-md ${
                      voiceState === 'listening'
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-[#6f7e45] hover:bg-[#5c693a]'
                    }`}
                    aria-label={voiceState === 'listening' ? 'Stop recording' : 'Start recording'}
                  >
                    {voiceState === 'listening' ? (
                      <MicOff size={32} className="text-white" />
                    ) : (
                      <Mic size={32} className="text-white" />
                    )}
                  </button>
                  <p className="text-xs sm:text-sm text-[#8a8678] text-center max-w-xs">
                    {voiceState === 'listening' ? t.voiceItems.listening : t.voiceItems.speakNow}
                  </p>
                  {voiceState === 'listening' && transcript && (
                    <div className="w-full bg-[#f9f7f2] border border-[#e5e1d8] rounded-xl p-3 text-sm text-[#4a4a38] italic">
                      "{transcript}"
                    </div>
                  )}
                  {voiceState === 'error' && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                  )}

                  {/* Manual transcript entry */}
                  <div className="w-full flex flex-col gap-2">
                    <textarea
                      placeholder={t.voiceItems.speakNow}
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-[#d6d1c2] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#4a4a38] focus:outline-none focus:border-[#6f7e45] resize-none placeholder-[#a39f90]"
                    />
                    {transcript && (
                      <button
                        onClick={() => parseTranscript(transcript)}
                        className="w-full bg-[#6f7e45] hover:bg-[#5c693a] text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                      >
                        {t.voiceItems.parseBtn}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* === PROCESSING === */}
              {voiceState === 'processing' && (
                <div className="flex flex-col items-center gap-4 p-10">
                  <Loader2 size={36} className="text-[#6f7e45] animate-spin" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[#4a4a38]">{t.voiceItems.processing}</p>
                  {transcript && (
                    <p className="text-xs text-[#8a8678] text-center italic max-w-xs">"{transcript}"</p>
                  )}
                </div>
              )}

              {/* === PREVIEW === */}
              {voiceState === 'preview' && (
                <div className="flex flex-col gap-4 p-4">
                  {/* Transcript */}
                  <div>
                    <p className="text-xs font-bold text-[#8a8678] uppercase tracking-wider mb-1.5">
                      {t.voiceItems.transcriptLabel}
                    </p>
                    <div className="bg-[#f9f7f2] border border-[#e5e1d8] rounded-xl px-3 py-2 text-sm text-[#4a4a38] italic flex items-center justify-between gap-2">
                      <span className="flex-1 min-w-0 truncate">"{transcript}"</span>
                      <button
                        onClick={() => setVoiceState('idle')}
                        className="text-[#8a8678] hover:text-[#6f7e45] shrink-0 p-1"
                        title={t.voiceItems.editTranscript}
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* AI source badge */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      aiSource === 'browser'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-[#f0f5ee] text-[#5c693a] border-[#d8e2cb]'
                    }`}>
                      {aiSource === 'browser' ? t.voiceItems.sourceBrowser : t.voiceItems.sourceCloud}
                    </span>
                  </div>

                  {/* Diff summary */}
                  <div className={`text-xs px-3 py-2 rounded-xl ${
                    mode === 'replace'
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-[#f0f5ee] border border-[#c8dbc8] text-[#4a572c]'
                  }`}>
                    {diffSummary()}
                  </div>

                  {/* Items list */}
                  <div>
                    <p className="text-xs font-bold text-[#8a8678] uppercase tracking-wider mb-2">
                      {t.voiceItems.parsedItems}
                    </p>
                    {parsedItems.length === 0 ? (
                      <p className="text-[#8a8678] text-sm text-center py-4">{t.voiceItems.noItemsParsed}</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {parsedItems.map((item, idx) => (
                          <div key={idx} className="bg-white border border-[#e5e1d8] rounded-xl p-3 flex flex-col gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const CatIcon = CATEGORY_ICONS[item.category] || Package;
                                return (
                                  <div className="w-7 h-7 rounded-lg bg-[#f0f5ee] border border-[#d8e2cb] text-[#6f7e45] flex items-center justify-center shrink-0">
                                    <CatIcon size={14} aria-hidden="true" />
                                  </div>
                                );
                              })()}
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(idx, { name: e.target.value })}
                                className="flex-1 min-w-0 bg-[#f9f7f2] border border-[#d6d1c2] rounded-lg px-2 py-1 text-sm font-semibold text-[#4a4a38] focus:outline-none focus:border-[#6f7e45]"
                              />
                              {/* Quantity */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => updateItem(idx, { quantity: Math.max(1, item.quantity - 1) })}
                                  className="w-6 h-6 rounded-md bg-[#f1eee6] flex items-center justify-center text-[#4a4a38] hover:bg-[#ece8df]"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-sm font-bold text-[#4a4a38] w-5 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateItem(idx, { quantity: item.quantity + 1 })}
                                  className="w-6 h-6 rounded-md bg-[#f1eee6] flex items-center justify-center text-[#4a4a38] hover:bg-[#ece8df]"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(idx)}
                                className="text-[#a39f90] hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                aria-label={t.common.delete}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Category & Tags row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <select
                                value={item.category}
                                onChange={(e) => updateItem(idx, { category: e.target.value as ItemCategory })}
                                className="bg-[#f9f7f2] border border-[#d6d1c2] rounded-lg px-2 py-1 text-xs text-[#4a4a38] focus:outline-none focus:border-[#6f7e45]"
                                aria-label="Category"
                              >
                                {Object.keys(CATEGORY_ICONS).map((cat) => (
                                  <option key={cat} value={cat}>{t.categories?.[cat as ItemCategory] || cat}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1 text-xs text-[#8a8678]">
                                <Tag size={10} aria-hidden="true" />
                                {item.tags.join(', ') || '—'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Re-record button */}
                  <button
                    onClick={() => { setVoiceState('idle'); setParsedItems([]); setIntentDetected(null); }}
                    className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm text-[#8a8678] hover:text-[#4a4a38] transition-colors"
                  >
                    <RotateCcw size={13} /> {t.voiceItems.retryBtn}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {voiceState === 'preview' && parsedItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#e5e1d8] bg-[#f9f7f2] flex gap-3 shrink-0 pb-6 sm:pb-4">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#d6d1c2] text-[#4a4a38] text-sm font-semibold hover:bg-[#f1eee6] transition-colors"
                >
                  {t.voiceItems.cancelBtn}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-[2] py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs ${
                    mode === 'replace'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#6f7e45] hover:bg-[#5c693a]'
                  }`}
                >
                  <Check size={16} aria-hidden="true" />
                  {t.voiceItems.confirmBtn}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

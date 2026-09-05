"use client";

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/src/store/useStore';
import { Search, X, MapPin, Sparkles, Send, Loader2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '@/src/lib/translations';
import { querySemanticInventory, type SemanticSearchResult } from '@/src/lib/browserAI';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'keyword' | 'semantic'>('keyword');
  const [query, setQuery] = useState('');
  
  // Semantic AI state
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiResult, setAiResult] = useState<SemanticSearchResult | null>(null);

  const { items, furniture, rooms, setActiveRoom, setActiveFurniture, language } = useStore();
  const t = getTranslation(language);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => { 
      setIsOpen(true); 
      setQuery('');
      setAiAnswer('');
      setAiResult(null);
      setTimeout(() => inputRef.current?.focus(), 50); 
    };
    window.addEventListener('open-search', handleOpen as EventListener);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('open-search', handleOpen as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const results = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  ).map(item => {
    const f = furniture.find(f => f.id === item.furnitureId);
    const r = f ? rooms.find(r => r.id === f.roomId) : null;
    return { item, furniture: f, room: r };
  });

  const navigateToItem = (roomId?: string, furnitureId?: string) => {
    if (roomId) setActiveRoom(roomId);
    if (furnitureId) {
      setActiveFurniture(furnitureId);
      window.dispatchEvent(new CustomEvent('open-furniture', { detail: furnitureId }));
    }
    setIsOpen(false);
  };

  const handleRunAiSearch = async (userPrompt?: string) => {
    const promptToRun = (userPrompt || aiQuery).trim();
    if (!promptToRun || isAiLoading) return;

    if (userPrompt) setAiQuery(userPrompt);
    setIsAiLoading(true);
    setAiAnswer('');
    setAiResult(null);

    try {
      const res = await querySemanticInventory(
        {
          query: promptToRun,
          rooms,
          furniture,
          items,
          language,
        },
        (chunk) => {
          setAiAnswer(chunk);
        }
      );
      setAiResult(res);
      if (res.answer) setAiAnswer(res.answer);
    } catch (err: any) {
      setAiAnswer(err.message || 'Error running AI search');
    } finally {
      setIsAiLoading(false);
    }
  };

  const matchedFurniture = aiResult?.matchedFurnitureId
    ? furniture.find((f) => f.id === aiResult.matchedFurnitureId)
    : null;
  const matchedRoom = matchedFurniture
    ? rooms.find((r) => r.id === matchedFurniture.roomId)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.common.search}
          className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[8vh] bg-[#4a4a38]/30 backdrop-blur-xs p-3 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            className="w-full max-w-2xl bg-[#fdfcf9] border border-[#e5e1d8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[82vh]"
          >
            {/* Tab navigation & Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2 bg-white border-b border-[#e5e1d8]">
              <div className="flex items-center gap-1.5 p-1 bg-[#f1eee6] rounded-xl border border-[#e2dec9]">
                <button
                  type="button"
                  onClick={() => setActiveTab('keyword')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'keyword'
                      ? 'bg-white text-[#4a4a38] shadow-xs'
                      : 'text-[#8a8678] hover:text-[#4a4a38]'
                  }`}
                >
                  <Search size={13} />
                  <span>{t.searchModal.tabKeyword}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('semantic');
                    if (query && !aiQuery) {
                      setAiQuery(query);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'semantic'
                      ? 'bg-[#6f7e45] text-white shadow-xs'
                      : 'text-[#6f7e45] hover:bg-[#e4eedf]'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{t.searchModal.tabSemantic}</span>
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label={t.common.close}
                className="text-[#a39f90] hover:text-[#4a4a38] bg-[#f1eee6] p-1.5 rounded-lg transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* TAB 1: KEYWORD SEARCH */}
            {activeTab === 'keyword' && (
              <>
                <div className="flex items-center p-3.5 sm:p-4 border-b border-[#e5e1d8] gap-3 bg-white">
                  <Search className="text-[#a39f90] shrink-0" size={18} aria-hidden="true" />
                  <input
                    ref={inputRef}
                    id="search-input"
                    type="text"
                    placeholder={t.searchModal.searchInputPlaceholder}
                    aria-label={t.searchModal.searchInputPlaceholder}
                    className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[#4a4a38] placeholder-[#a39f90]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && results.length === 0 && query.trim()) {
                        setActiveTab('semantic');
                        setAiQuery(query);
                        handleRunAiSearch(query);
                      }
                    }}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      aria-label={t.searchModal.clearBtn}
                      className="text-xs text-[#a39f90] hover:text-[#4a4a38] px-1.5 py-0.5 rounded"
                    >
                      {t.searchModal.clearBtn}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3 bg-white">
                  {query.length === 0 ? (
                    <div className="p-8 text-center text-[#a39f90] text-sm flex flex-col items-center gap-2">
                      <Search size={24} className="opacity-40" />
                      <p>{t.searchModal.typeToSearch}</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-6 text-center text-[#8a8678] flex flex-col items-center gap-3">
                      <p className="text-sm">{t.searchModal.noResults}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('semantic');
                          setAiQuery(query);
                          handleRunAiSearch(query);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#f0f5ee] hover:bg-[#e4eedf] border border-[#d8e2cb] text-[#4a572c] text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
                      >
                        <Sparkles size={14} className="text-[#6f7e45]" />
                        <span>Hỏi AI tìm vị trí &quot;{query}&quot;</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {results.map((res) => (
                        <div
                          key={res.item.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`${res.item.name}, ${res.room?.name || ''} ${res.furniture?.name || ''}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigateToItem(res.room?.id, res.furniture?.id);
                            }
                          }}
                          className="p-3 rounded-xl bg-[#fdfcf9] border border-[#e5e1d8] hover:border-[#8a9a5b] cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 group transition-all shadow-2xs"
                          onClick={() => navigateToItem(res.room?.id, res.furniture?.id)}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[#4a4a38] text-sm truncate">{res.item.name}</div>
                            <div className="text-[10px] text-[#a39f90] uppercase tracking-wide mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-[#f1eee6] rounded-full border border-[#d6d1c2] text-[#8a8678] font-semibold">
                                {t.categories[res.item.category] || res.item.category}
                              </span>
                              {res.item.tags.length > 0 && <span className="truncate">· {res.item.tags.join(', ')}</span>}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-[#a39f90] flex items-center gap-1 group-hover:text-[#8a9a5b] transition-colors shrink-0">
                            <MapPin size={12} aria-hidden="true" />
                            <span>{res.room?.name} › {res.furniture?.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: SEMANTIC AI SPATIAL Q&A */}
            {activeTab === 'semantic' && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#fdfcf9]">
                {/* AI Input bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunAiSearch();
                  }}
                  className="flex items-center gap-2 bg-white border border-[#d6d1c2] focus-within:border-[#6f7e45] rounded-xl p-2 shadow-2xs transition-colors"
                >
                  <Sparkles size={18} className="text-[#6f7e45] ml-2 shrink-0" />
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder={t.searchModal.askAiPlaceholder}
                    className="flex-1 bg-transparent text-xs sm:text-sm text-[#4a4a38] placeholder-[#a39f90] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="px-3 py-1.5 bg-[#6f7e45] hover:bg-[#5c693a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs shrink-0"
                  >
                    {isAiLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CornerDownLeft size={13} />
                    )}
                    <span>{t.searchModal.askAiBtn}</span>
                  </button>
                </form>

                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-[11px] text-[#8a8678] font-medium">{t.searchModal.quickPromptsLabel}</span>
                  {t.searchModal.quickPrompts.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => handleRunAiSearch(qp)}
                      className="px-2.5 py-1 rounded-full bg-white border border-[#e5e1d8] hover:border-[#8a9a5b] text-[#6a6658] text-[11px] font-medium transition-colors shadow-2xs"
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                {/* AI Result Box */}
                {(isAiLoading || aiAnswer) && (
                  <div className="bg-white border border-[#e5e1d8] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3 animate-in fade-in">
                    {/* Header badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#f0f5ee] text-[#6f7e45] flex items-center justify-center">
                          <Sparkles size={13} />
                        </div>
                        <span className="text-xs font-bold text-[#4a4a38]">
                          {aiResult?.source === 'browser' ? t.searchModal.sourceOnDevice : t.searchModal.sourceCloud}
                        </span>
                      </div>

                      {isAiLoading && (
                        <span className="text-[11px] text-[#8a9a5b] font-medium flex items-center gap-1">
                          <Loader2 size={11} className="animate-spin" />
                          {t.searchModal.thinking}
                        </span>
                      )}
                    </div>

                    {/* Answer text */}
                    <div className="text-xs sm:text-sm text-[#4a4a38] leading-relaxed whitespace-pre-wrap">
                      {aiAnswer || t.searchModal.thinking}
                    </div>

                    {/* 3D Fly-to CTA card */}
                    {matchedFurniture && (
                      <div className="mt-2 p-3 bg-[#f0f5ee] border border-[#d8e2cb] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin size={16} className="text-[#6f7e45] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#4a572c] truncate">
                              {matchedFurniture.name}
                            </p>
                            <p className="text-[11px] text-[#6a7a48] truncate">
                              {matchedRoom?.name || 'Room'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigateToItem(matchedRoom?.id, matchedFurniture.id)}
                          className="px-4 py-2 bg-[#6f7e45] hover:bg-[#5c693a] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                        >
                          <span>{t.searchModal.flyToIn3D}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

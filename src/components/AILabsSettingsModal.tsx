"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Cloud, Monitor, Zap, KeyRound, Eye, EyeOff, Check, ExternalLink, Trash2, Camera, Mic, Bot } from 'lucide-react';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';
import { useStore } from '@/src/store/useStore';
import { getTranslation } from '@/src/lib/translations';
import type { FeatureFlagKey, AIProvider } from '@/src/lib/featureFlags';
import { checkChromeAISupport, benchmarkChromeAI, type ChromeAIFeatureStatus } from '@/src/lib/browserAI';

interface FlagInfo {
  key: FeatureFlagKey;
  labelKey: 'flagImageToRoom' | 'flagVoiceToItems' | 'flagBrowserAgent';
  descKey: 'flagImageToRoomDesc' | 'flagVoiceToItemsDesc' | 'flagBrowserAgentDesc';
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const FLAGS: FlagInfo[] = [
  { key: 'aiImageToRoom', labelKey: 'flagImageToRoom', descKey: 'flagImageToRoomDesc', Icon: Camera },
  { key: 'aiVoiceToItems', labelKey: 'flagVoiceToItems', descKey: 'flagVoiceToItemsDesc', Icon: Mic },
  { key: 'aiBrowserAgent', labelKey: 'flagBrowserAgent', descKey: 'flagBrowserAgentDesc', Icon: Bot },
];

const PROVIDERS: {
  value: AIProvider;
  icon: React.ReactNode;
  labelKey: 'providerAuto' | 'providerCloud' | 'providerBrowser';
  descKey: 'providerAutoDesc' | 'providerCloudDesc' | 'providerBrowserDesc';
}[] = [
  { value: 'auto', icon: <Zap size={16} />, labelKey: 'providerAuto', descKey: 'providerAutoDesc' },
  { value: 'cloud', icon: <Cloud size={16} />, labelKey: 'providerCloud', descKey: 'providerCloudDesc' },
  { value: 'browser', icon: <Monitor size={16} />, labelKey: 'providerBrowser', descKey: 'providerBrowserDesc' },
];

export function AILabsSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    flags,
    aiProvider,
    browserAIAvailable,
    manualApiKey,
    hasKey,
    setFlag,
    setAIProvider,
    detectBrowserAI,
    setManualApiKey,
    removeManualApiKey,
  } = useFeatureFlags();

  const [inputKey, setInputKey] = useState(manualApiKey);
  const [showKey, setShowKey] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Chrome Built-in AI diagnostics state
  const [chromeStatus, setChromeStatus] = useState<ChromeAIFeatureStatus>({
    promptAPI: 'no',
    summarizerAPI: false,
    translatorAPI: false,
    writerAPI: false,
    languageDetectorAPI: false,
  });
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{ success: boolean; latencyMs: number; error?: string } | null>(null);
  const [refreshingAI, setRefreshingAI] = useState(false);

  const { language } = useStore();
  const t = getTranslation(language);

  useEffect(() => {
    detectBrowserAI();
    checkChromeAISupport().then(setChromeStatus);

    const handleOpen = () => {
      detectBrowserAI();
      setInputKey(useFeatureFlags.getState().manualApiKey);
      checkChromeAISupport().then(setChromeStatus);
      setIsOpen(true);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('open-ai-labs', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-ai-labs', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSaveApiKey = () => {
    setManualApiKey(inputKey.trim());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleRemoveApiKey = () => {
    removeManualApiKey();
    setInputKey('');
    setJustSaved(false);
  };

  const hasEnvKey = typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-labs-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full sm:max-w-lg bg-[#fdfcf9] border-t sm:border border-[#e5e1d8] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#4a4a38]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile pull handle */}
            <div className="sm:hidden w-10 h-1 bg-[#d6d1c2] rounded-full mx-auto mt-2.5 mb-1 shrink-0" aria-hidden="true" />

            {/* Header with Findable Room Sage/Olive aesthetic */}
            <div className="bg-gradient-to-r from-[#8a9a5b] to-[#a3b18a] text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 id="ai-labs-title" className="font-bold text-base sm:text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                    {t.aiLabs.title}
                  </h2>
                  <p className="text-white/85 text-xs">{t.aiLabs.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t.common.close}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
              {/* API Key Configuration Section */}
              <section className="bg-white border border-[#e5e1d8] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-[#6f7e45]" aria-hidden="true" />
                    <h3 className="text-xs font-bold text-[#4a4a38] uppercase tracking-wider">
                      {t.aiLabs.apiKeyTitle}
                    </h3>
                  </div>

                  {/* Status badge */}
                  {manualApiKey ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Check size={11} /> {t.aiLabs.apiKeyStatusActive}
                    </span>
                  ) : hasEnvKey ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c693a] bg-[#f0f5ee] border border-[#d8e2cb] px-2.5 py-0.5 rounded-full">
                      {t.aiLabs.apiKeyStatusEnv}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {t.aiLabs.apiKeyStatusNone}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#8a8678] leading-relaxed">
                  {t.aiLabs.apiKeyDesc}
                </p>

                {/* Input & Action */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder={t.aiLabs.apiKeyPlaceholder}
                      className="w-full bg-[#f9f7f2] border border-[#d6d1c2] focus:border-[#6f7e45] rounded-xl px-3.5 py-2.5 text-xs text-[#4a4a38] font-mono focus:outline-none transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      aria-label={showKey ? 'Hide key' : 'Show key'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a39f90] hover:text-[#4a4a38] p-1 rounded transition-colors"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      disabled={!inputKey.trim() || inputKey.trim() === manualApiKey}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#6f7e45] hover:bg-[#5c693a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <Check size={13} /> {t.aiLabs.apiKeySave}
                    </button>

                    {manualApiKey && (
                      <button
                        type="button"
                        onClick={handleRemoveApiKey}
                        title={t.aiLabs.apiKeyRemove}
                        aria-label={t.aiLabs.apiKeyRemove}
                        className="p-2.5 text-[#a39f90] hover:text-red-500 hover:bg-red-50 border border-[#d6d1c2] hover:border-red-200 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback message */}
                {justSaved && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
                    {t.aiLabs.apiKeySaved}
                  </p>
                )}

                {/* Free API key helper link */}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#6f7e45] hover:text-[#5c693a] hover:underline inline-flex items-center gap-1 font-medium mt-0.5"
                >
                  {t.aiLabs.apiKeyGetFree}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </section>

              {/* Chrome Built-in AI Diagnostics Section */}
              <section className="bg-white border border-[#e5e1d8] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor size={16} className="text-[#6f7e45]" aria-hidden="true" />
                    <div>
                      <h3 className="text-xs font-bold text-[#4a4a38] uppercase tracking-wider">
                        {t.aiLabs.chromeAITitle}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setRefreshingAI(true);
                      const status = await checkChromeAISupport();
                      setChromeStatus(status);
                      detectBrowserAI();
                      setRefreshingAI(false);
                    }}
                    className="text-[11px] text-[#8a9a5b] hover:text-[#6f7e45] font-semibold hover:underline"
                  >
                    {refreshingAI ? '...' : (language === 'vi' ? 'Quét lại' : 'Rescan')}
                  </button>
                </div>

                <p className="text-xs text-[#8a8678] leading-relaxed">
                  {t.aiLabs.chromeAISubtitle}
                </p>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Prompt API (Nano) */}
                  <div className="p-2.5 rounded-xl border border-[#e5e1d8] bg-[#fdfcf9] flex flex-col gap-1">
                    <span className="text-[11px] text-[#8a8678] font-medium">{t.aiLabs.promptAPI}</span>
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md w-fit ${
                      chromeStatus.promptAPI === 'readily'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : chromeStatus.promptAPI === 'after-download'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-[#f1eee6] text-[#8a8678]'
                    }`}>
                      {chromeStatus.promptAPI === 'readily'
                        ? t.aiLabs.statusReady
                        : chromeStatus.promptAPI === 'after-download'
                        ? t.aiLabs.statusDownloading
                        : t.aiLabs.statusUnsupported}
                    </span>
                  </div>

                  {/* Summarizer API */}
                  <div className="p-2.5 rounded-xl border border-[#e5e1d8] bg-[#fdfcf9] flex flex-col gap-1">
                    <span className="text-[11px] text-[#8a8678] font-medium">{t.aiLabs.summarizerAPI}</span>
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md w-fit ${
                      chromeStatus.summarizerAPI
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#f1eee6] text-[#8a8678]'
                    }`}>
                      {chromeStatus.summarizerAPI ? t.aiLabs.statusReady : t.aiLabs.statusUnsupported}
                    </span>
                  </div>

                  {/* Translator API */}
                  <div className="p-2.5 rounded-xl border border-[#e5e1d8] bg-[#fdfcf9] flex flex-col gap-1">
                    <span className="text-[11px] text-[#8a8678] font-medium">{t.aiLabs.translatorAPI}</span>
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md w-fit ${
                      chromeStatus.translatorAPI
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#f1eee6] text-[#8a8678]'
                    }`}>
                      {chromeStatus.translatorAPI ? t.aiLabs.statusReady : t.aiLabs.statusUnsupported}
                    </span>
                  </div>

                  {/* Writer / Rewriter API */}
                  <div className="p-2.5 rounded-xl border border-[#e5e1d8] bg-[#fdfcf9] flex flex-col gap-1">
                    <span className="text-[11px] text-[#8a8678] font-medium">{t.aiLabs.writerAPI}</span>
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md w-fit ${
                      chromeStatus.writerAPI
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#f1eee6] text-[#8a8678]'
                    }`}>
                      {chromeStatus.writerAPI ? t.aiLabs.statusReady : t.aiLabs.statusUnsupported}
                    </span>
                  </div>
                </div>

                {/* Benchmark On-Device AI */}
                <div className="flex flex-col gap-2 pt-1 border-t border-[#f1eee6]">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={benchmarking || chromeStatus.promptAPI === 'no'}
                      onClick={async () => {
                        setBenchmarking(true);
                        setBenchmarkResult(null);
                        const res = await benchmarkChromeAI();
                        setBenchmarkResult(res);
                        setBenchmarking(false);
                      }}
                      className="px-3 py-2 bg-[#f0f5ee] hover:bg-[#e4eedf] border border-[#d8e2cb] text-[#4a572c] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Zap size={13} className="text-[#6f7e45]" />
                      <span>{benchmarking ? t.aiLabs.testRunning : t.aiLabs.testAISpeedBtn}</span>
                    </button>

                    <a
                      href="https://developer.chrome.com/docs/ai/built-in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#8a8678] hover:text-[#4a4a38] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Docs Chrome AI</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  {benchmarkResult && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      benchmarkResult.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
                        : 'bg-amber-50 border border-amber-200 text-amber-800'
                    }`}>
                      {benchmarkResult.success ? (
                        <>
                          <Check size={14} className="shrink-0 text-emerald-600" />
                          <span>{t.aiLabs.testSuccess.replace('{{ms}}', String(benchmarkResult.latencyMs))}</span>
                        </>
                      ) : (
                        <span>{t.aiLabs.testFailed} ({benchmarkResult.error})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Flags helper tip */}
                <details className="text-[11px] text-[#8a8678] cursor-pointer">
                  <summary className="hover:text-[#4a4a38] font-medium select-none">
                    {t.aiLabs.chromeFlagGuide}
                  </summary>
                  <div className="mt-2 p-2.5 bg-[#f9f7f2] rounded-xl border border-[#e5e1d8] flex flex-col gap-1 text-[11px] leading-relaxed">
                    <p>1. Mở tab mới và dán vào thanh địa chỉ: <code className="bg-white px-1.5 py-0.5 rounded border border-[#d6d1c2] font-mono text-[10px]">chrome://flags/#prompt-api-for-gemini-nano</code> &rarr; chọn <b>Enabled</b>.</p>
                    <p>2. Dán: <code className="bg-white px-1.5 py-0.5 rounded border border-[#d6d1c2] font-mono text-[10px]">chrome://flags/#optimization-guide-on-device-model</code> &rarr; chọn <b>Enabled BypassPrefRequirement</b>.</p>
                    <p>3. Bấm <b>Relaunch</b> để khởi động lại Chrome và trải nghiệm AI cục bộ không tốn phí.</p>
                  </div>
                </details>
              </section>

              {/* Provider selector */}
              <section>
                <h3 className="text-xs font-bold text-[#8a8678] uppercase tracking-wider mb-2.5">
                  {t.aiLabs.providerTitle}
                </h3>
                <div className="flex flex-col gap-2">
                  {PROVIDERS.map((p) => {
                    const isSelected = aiProvider === p.value;
                    return (
                      <button
                        key={p.value}
                        onClick={() => setAIProvider(p.value)}
                        className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#8a9a5b] bg-[#f2f5ea] shadow-2xs'
                            : 'border-[#e5e1d8] bg-white hover:border-[#8a9a5b] hover:bg-[#faf9f5]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-[#6f7e45] text-white shadow-xs' : 'bg-[#f1eee6] text-[#8a8678]'
                        }`}>
                          {p.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-[#4a4a38]">{t.aiLabs[p.labelKey]}</p>
                          <p className="text-[11px] sm:text-xs text-[#8a8678] truncate">{t.aiLabs[p.descKey]}</p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#6f7e45] flex items-center justify-center text-white shrink-0 shadow-2xs">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Feature flags toggles */}
              <section>
                <h3 className="text-xs font-bold text-[#8a8678] uppercase tracking-wider mb-2.5">
                  {t.aiLabs.featureFlagsTitle}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {FLAGS.map((flag) => (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between gap-3 p-3 bg-white border border-[#e5e1d8] rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#f0f5ee] border border-[#d8e2cb] text-[#6f7e45] flex items-center justify-center shrink-0">
                          <flag.Icon size={16} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#4a4a38]">{t.aiLabs[flag.labelKey]}</p>
                          <p className="text-[11px] text-[#8a8678]">{t.aiLabs[flag.descKey]}</p>
                        </div>
                      </div>
                      {/* Toggle switch */}
                      <button
                        role="switch"
                        aria-checked={flags[flag.key]}
                        onClick={() => setFlag(flag.key, !flags[flag.key])}
                        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6f7e45] ${
                          flags[flag.key] ? 'bg-[#6f7e45]' : 'bg-[#d6d1c2]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                            flags[flag.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#e5e1d8] bg-[#f9f7f2] shrink-0 pb-6 sm:pb-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#6f7e45] hover:bg-[#5c693a] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                {t.aiLabs.closeBtn}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

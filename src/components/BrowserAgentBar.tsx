"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Mic, MicOff, X, CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { useStore } from '@/src/store/useStore';
import { useFeatureFlags } from '@/src/store/useFeatureFlags';
import { getTranslation } from '@/src/lib/translations';
import { planAgentActions, executeAgentTool, type AgentPlan, type AgentAction } from '@/src/lib/browserAgent';

type AgentState = 'idle' | 'thinking' | 'plan_ready' | 'executing' | 'done' | 'error';

export function BrowserAgentBar() {
  const [input, setInput] = useState('');
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [executingStep, setExecutingStep] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const store = useStore();
  const { isEnabled, aiProvider, browserAIAvailable } = useFeatureFlags();
  const { language } = store;
  const t = getTranslation(language);

  // Detect mount for browser AI
  useEffect(() => {
    useFeatureFlags.getState().detectBrowserAI();
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const instruction = input.trim();
    if (!instruction || agentState === 'thinking') return;

    setAgentState('thinking');
    setResults([]);
    setErrorMsg('');
    setPlan(null);

    try {
      const context = {
        rooms: store.rooms,
        furniture: store.furniture,
        items: store.items,
        activeRoomId: store.activeRoomId,
        language,
      };

      const result = await planAgentActions(instruction, context);

      if (result === 'needs_cloud') {
        // Cloud copilot route (agent API — simplified version triggers search / open modals)
        handleCloudCopilot(instruction);
        return;
      }

      setPlan(result);
      setAgentState(result.requiresConfirmation ? 'plan_ready' : 'executing');

      if (!result.requiresConfirmation) {
        await executePlan(result.actions);
      }
    } catch (err: any) {
      setErrorMsg(err.message ?? t.agentBar.errorMessage);
      setAgentState('error');
    }
  }, [input, agentState, store, language]);

  const handleCloudCopilot = (instruction: string) => {
    // For non-browser AI: trigger search if it looks like a find query
    const lower = instruction.toLowerCase();
    if (
      lower.includes('find') || lower.includes('where') ||
      lower.includes('tìm') || lower.includes('ở đâu')
    ) {
      window.dispatchEvent(new CustomEvent('open-search'));
    } else if (lower.includes('scan') || lower.includes('photo') || lower.includes('ảnh')) {
      window.dispatchEvent(new CustomEvent('open-image-to-room'));
    } else {
      setErrorMsg(t.agentBar.cloudFallback);
      setAgentState('error');
      return;
    }
    setAgentState('idle');
    setInput('');
  };

  const executePlan = async (actions: AgentAction[]) => {
    setAgentState('executing');
    const resultMessages: string[] = [];

    for (let i = 0; i < actions.length; i++) {
      setExecutingStep(i + 1);
      const result = await executeAgentTool(actions[i], {
        addRoom: store.addRoom,
        addFurniture: store.addFurniture,
        addItem: store.addItem,
        replaceFurnitureItems: store.replaceFurnitureItems,
        furniture: store.furniture,
        activeRoomId: store.activeRoomId,
        onSetActiveRoom: store.setActiveRoom,
        onFindAndHighlight: (query) => window.dispatchEvent(new CustomEvent('open-search')),
        onTriggerPhotoScan: () => window.dispatchEvent(new CustomEvent('open-image-to-room')),
      });
      resultMessages.push(result.message);
    }

    setResults(resultMessages);
    setAgentState('done');
    setInput('');
    setPlan(null);
    // Auto-reset after 3 seconds
    setTimeout(() => setAgentState('idle'), 3000);
  };

  const handleConfirmPlan = () => {
    if (plan) executePlan(plan.actions);
  };

  const handleCancelPlan = () => {
    setPlan(null);
    setAgentState('idle');
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript ?? '';
      setInput(text);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  if (!isEnabled('aiBrowserAgent')) return null;

  return (
    <div className="fixed bottom-[60px] sm:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] sm:w-auto sm:max-w-xl z-40 px-0">
      <AnimatePresence mode="popLayout">
        {/* Plan confirmation */}
        {agentState === 'plan_ready' && plan && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 bg-white border border-[#e5e1d8] rounded-2xl shadow-lg p-4 text-sm"
          >
            <p className="font-semibold text-[#4a4a38] mb-2">✨ {plan.summary}</p>
            {plan.actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-[#8a8678] text-xs mb-1">
                <ChevronRight size={12} className="shrink-0 mt-0.5 text-[#4a7c59]" />
                {a.description}
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCancelPlan}
                className="flex-1 py-1.5 rounded-lg border border-[#d6d1c2] text-[#4a4a38] text-xs font-semibold hover:bg-[#f1eee6] flex items-center justify-center gap-1 transition-colors"
              >
                <XCircle size={12} /> {t.agentBar.cancelPlan}
              </button>
              <button
                onClick={handleConfirmPlan}
                className="flex-[2] py-1.5 rounded-lg bg-[#6f7e45] text-white text-xs font-semibold hover:bg-[#5c693a] flex items-center justify-center gap-1 transition-colors shadow-2xs"
              >
                <CheckCircle2 size={12} /> {t.agentBar.confirmPlan}
              </button>
            </div>
          </motion.div>
        )}

        {/* Status feedback */}
        {(agentState === 'thinking' || agentState === 'executing' || agentState === 'done' || agentState === 'error') && (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mb-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs ${
              agentState === 'done' ? 'bg-green-50 text-green-700 border border-green-200' :
              agentState === 'error' ? 'bg-red-50 text-red-500 border border-red-200' :
              'bg-[#f0f5ee] text-[#4a572c] border border-[#c8dbc8]'
            }`}
          >
            {agentState === 'thinking' && (
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-[#6f7e45]" /> {t.agentBar.thinking}
              </span>
            )}
            {agentState === 'executing' && (
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-[#6f7e45]" />
                {t.agentBar.executingStep
                  .replace('{{step}}', String(executingStep))
                  .replace('{{total}}', String(plan?.actions.length ?? executingStep))}
              </span>
            )}
            {agentState === 'done' && `✅ ${t.agentBar.doneMessage} ${results.join(' · ')}`}
            {agentState === 'error' && `❌ ${errorMsg || t.agentBar.errorMessage}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-[#e5e1d8] rounded-2xl shadow-xl px-3 py-2"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6f7e45] to-[#8a9a5b] flex items-center justify-center shrink-0 shadow-2xs">
          <Sparkles size={14} className="text-white" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={window.innerWidth < 640 ? t.agentBar.placeholderMobile : t.agentBar.placeholder}
          aria-label={t.agentBar.placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-[#4a4a38] placeholder-[#a39f90] focus:outline-none"
          disabled={agentState === 'thinking' || agentState === 'executing'}
        />
        <button
          type="button"
          onClick={isListening ? () => recognitionRef.current?.stop() : startVoice}
          aria-label={t.agentBar.voiceBtn}
          className={`p-1.5 rounded-lg transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-[#a39f90] hover:text-[#6f7e45]'}`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <button
          type="submit"
          disabled={!input.trim() || agentState === 'thinking' || agentState === 'executing'}
          aria-label={t.agentBar.sendBtn}
          className="w-8 h-8 rounded-xl bg-[#6f7e45] hover:bg-[#5c693a] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0 shadow-2xs"
        >
          {agentState === 'thinking' ? (
            <Loader2 size={14} className="text-white animate-spin" />
          ) : (
            <Send size={14} className="text-white" />
          )}
        </button>
      </form>
    </div>
  );
}

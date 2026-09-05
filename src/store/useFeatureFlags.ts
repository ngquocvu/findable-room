import { create } from 'zustand';
import {
  FeatureFlags,
  FeatureFlagKey,
  AIProvider,
  resolveFlags,
  persistFlagOverride,
  persistAIProvider,
  loadAIProvider,
  isBrowserAIAvailable,
  getManualApiKey,
  setManualApiKey as persistManualApiKey,
  removeManualApiKey as clearManualApiKey,
  hasAnyApiKey,
} from '@/src/lib/featureFlags';

interface FeatureFlagsState {
  flags: FeatureFlags;
  aiProvider: AIProvider;
  browserAIAvailable: boolean;
  manualApiKey: string;
  hasKey: boolean;

  /** Enable or disable a feature flag at runtime */
  setFlag: (key: FeatureFlagKey, value: boolean) => void;

  /** Switch the preferred AI provider ('auto' | 'cloud' | 'browser') */
  setAIProvider: (provider: AIProvider) => void;

  /** Check if a specific flag is enabled */
  isEnabled: (key: FeatureFlagKey) => boolean;

  /** Re-detect window.ai availability (call on mount) */
  detectBrowserAI: () => void;

  /** Set or update manual Gemini API key */
  setManualApiKey: (key: string) => void;

  /** Remove manual Gemini API key */
  removeManualApiKey: () => void;
}

export const useFeatureFlags = create<FeatureFlagsState>((set, get) => ({
  flags: resolveFlags(),
  aiProvider: loadAIProvider(),
  browserAIAvailable: false, // Will be set on client mount
  manualApiKey: getManualApiKey(),
  hasKey: hasAnyApiKey(),

  setFlag: (key, value) => {
    persistFlagOverride(key, value);
    set((state) => ({
      flags: { ...state.flags, [key]: value },
    }));
  },

  setAIProvider: (provider) => {
    persistAIProvider(provider);
    set({ aiProvider: provider });
  },

  isEnabled: (key) => get().flags[key],

  detectBrowserAI: () => {
    set({
      browserAIAvailable: isBrowserAIAvailable(),
      manualApiKey: getManualApiKey(),
      hasKey: hasAnyApiKey(),
    });
  },

  setManualApiKey: (key: string) => {
    persistManualApiKey(key);
    set({
      manualApiKey: key.trim(),
      hasKey: hasAnyApiKey(),
    });
  },

  removeManualApiKey: () => {
    clearManualApiKey();
    set({
      manualApiKey: '',
      hasKey: hasAnyApiKey(),
    });
  },
}));


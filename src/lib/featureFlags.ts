// =========================================================
// Feature Flags — Controls which AI features are enabled.
//
// Resolution order (highest priority first):
//   1. localStorage runtime override (user toggle in AI Labs)
//   2. NEXT_PUBLIC_FF_* environment variables
//   3. Safe defaults (based on env presence / window.ai)
// =========================================================

export type FeatureFlagKey = 'aiImageToRoom' | 'aiVoiceToItems' | 'aiBrowserAgent';

export type AIProvider = 'auto' | 'cloud' | 'browser';

export interface FeatureFlags {
  aiImageToRoom: boolean;  // AI photo → 3D room scan
  aiVoiceToItems: boolean; // Voice → furniture items
  aiBrowserAgent: boolean; // In-app copilot + on-device Gemini Nano
}

// Storage keys
export const FF_STORAGE_KEY = 'roomfindable_feature_flags';
export const AI_PROVIDER_STORAGE_KEY = 'roomfindable_ai_provider';
export const API_KEY_STORAGE_KEY = 'roomfindable_gemini_api_key';

/** Get user-entered manual Gemini API key from localStorage */
export function getManualApiKey(): string {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(API_KEY_STORAGE_KEY) || '').trim();
}

/** Persist user-entered manual Gemini API key */
export function setManualApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

/** Remove manual Gemini API key */
export function removeManualApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

/** Check if a manual API key is stored */
export function hasManualApiKey(): boolean {
  return !!getManualApiKey();
}

/** Check if any API key exists (manual in localStorage, or in env) */
export function hasAnyApiKey(): boolean {
  if (hasManualApiKey()) return true;
  if (typeof process !== 'undefined') {
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
      return true;
    }
  }
  return false;
}

/** Check if the browser's built-in window.ai Prompt API is available */
export function isBrowserAIAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ai' in window && typeof (window as any).ai?.languageModel?.create === 'function';
}

/** Resolve defaults from env vars. Defaults to true unless explicitly disabled with 'false' */
export function getEnvDefaults(): FeatureFlags {
  const parseFlag = (envVal: string | undefined, fallback: boolean): boolean => {
    if (envVal === 'true') return true;
    if (envVal === 'false') return false;
    return fallback;
  };

  return {
    aiImageToRoom: parseFlag(
      process.env.NEXT_PUBLIC_FF_IMAGE_TO_ROOM,
      true
    ),
    aiVoiceToItems: parseFlag(
      process.env.NEXT_PUBLIC_FF_VOICE_TO_ITEMS,
      true
    ),
    aiBrowserAgent: parseFlag(
      process.env.NEXT_PUBLIC_FF_BROWSER_AGENT,
      true
    ),
  };
}

/** Merge env defaults with any user overrides from localStorage */
export function resolveFlags(): FeatureFlags {
  const defaults = getEnvDefaults();
  if (typeof window === 'undefined') return defaults;

  try {
    const stored = localStorage.getItem(FF_STORAGE_KEY);
    if (!stored) return defaults;
    const overrides = JSON.parse(stored) as Partial<FeatureFlags>;
    return { ...defaults, ...overrides };
  } catch {
    return defaults;
  }
}

/** Persist a single flag override to localStorage */
export function persistFlagOverride(key: FeatureFlagKey, value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(FF_STORAGE_KEY);
    const current = stored ? (JSON.parse(stored) as Partial<FeatureFlags>) : {};
    current[key] = value;
    localStorage.setItem(FF_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

/** Persist AI provider preference */
export function persistAIProvider(provider: AIProvider): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
}

/** Load AI provider preference */
export function loadAIProvider(): AIProvider {
  if (typeof window === 'undefined') return 'auto';
  const saved = localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
  if (saved === 'cloud' || saved === 'browser' || saved === 'auto') return saved;
  return 'auto';
}


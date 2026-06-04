import type { Provider } from "../types.js";

export interface OpenRouterProviderOptions {
  complete: (prompt: string) => Promise<string>;
  maxContextLength?: number;
}

export function createOpenRouterProvider(
  options: OpenRouterProviderOptions
): Provider {
  return {
    complete: options.complete,
    maxContextLength: options.maxContextLength ?? 128_000,
    countTokens: async (text: string) => Math.ceil(text.length / 4),
  };
}

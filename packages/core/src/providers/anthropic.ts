import type { Provider } from "../types.js";

export interface AnthropicProviderOptions {
  complete: (prompt: string) => Promise<string>;
  maxContextLength?: number;
}

export function createAnthropicProvider(
  options: AnthropicProviderOptions
): Provider {
  return {
    complete: options.complete,
    maxContextLength: options.maxContextLength ?? 200_000,
    countTokens: async (text: string) => Math.ceil(text.length / 4),
  };
}

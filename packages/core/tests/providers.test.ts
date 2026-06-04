import { describe, it, expect, vi } from "vitest";
import { createOpenAIProvider } from "../src/providers/openai.js";
import { createAnthropicProvider } from "../src/providers/anthropic.js";
import { createOpenRouterProvider } from "../src/providers/openrouter.js";

describe("createOpenAIProvider", () => {
  it("implements Provider interface", async () => {
    const mockComplete = vi.fn().mockResolvedValue("hello world");
    const provider = createOpenAIProvider({ complete: mockComplete });
    const result = await provider.complete("test prompt");
    expect(result).toBe("hello world");
    expect(mockComplete).toHaveBeenCalledWith("test prompt");
  });

  it("reports maxContextLength", () => {
    const provider = createOpenAIProvider({ complete: async () => "" });
    expect(provider.maxContextLength).toBe(128_000);
  });

  it("counts tokens approximately", async () => {
    const provider = createOpenAIProvider({ complete: async () => "" });
    const tokens = await provider.countTokens("hello world");
    expect(tokens).toBeGreaterThan(0);
  });
});

describe("createAnthropicProvider", () => {
  it("implements Provider interface", async () => {
    const mockComplete = vi.fn().mockResolvedValue("claude response");
    const provider = createAnthropicProvider({ complete: mockComplete });
    const result = await provider.complete("test prompt");
    expect(result).toBe("claude response");
  });

  it("reports maxContextLength", () => {
    const provider = createAnthropicProvider({ complete: async () => "" });
    expect(provider.maxContextLength).toBe(200_000);
  });
});

describe("createOpenRouterProvider", () => {
  it("implements Provider interface", async () => {
    const mockComplete = vi.fn().mockResolvedValue("openrouter response");
    const provider = createOpenRouterProvider({ complete: mockComplete });
    const result = await provider.complete("test prompt");
    expect(result).toBe("openrouter response");
  });

  it("reports maxContextLength", () => {
    const provider = createOpenRouterProvider({ complete: async () => "" });
    expect(provider.maxContextLength).toBe(128_000);
  });
});

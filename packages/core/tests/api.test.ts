import { describe, it, expect, vi } from "vitest";
import { rlm, RLM } from "../src/api.js";

describe("rlm", () => {
  it("processes text with simple function call", async () => {
    const mockProvider = {
      complete: vi.fn().mockResolvedValue("processed"),
      countTokens: async () => 10,
      maxContextLength: 128_000,
    };
    const result = await rlm("Hello world", { provider: mockProvider });
    expect(result).toBe("processed");
  });

  it("accepts maxDepth option", async () => {
    const mockProvider = {
      complete: vi.fn().mockResolvedValue("deep result"),
      countTokens: async () => 10,
      maxContextLength: 128_000,
    };
    const result = await rlm("Long text input here", {
      provider: mockProvider,
      maxDepth: 5,
    });
    expect(result).toBe("deep result");
  });
});

describe("RLM builder", () => {
  it("builds and processes with fluent API", async () => {
    const mockProvider = {
      complete: vi.fn().mockResolvedValue("builder result"),
      countTokens: async () => 10,
      maxContextLength: 128_000,
    };
    const result = await new RLM()
      .setProvider(mockProvider)
      .setMaxDepth(5)
      .setChunkSize(2000)
      .process("Test input");
    expect(result).toBe("builder result");
  });

  it("supports event subscription", async () => {
    const mockProvider = {
      complete: vi.fn().mockResolvedValue("event test"),
      countTokens: async () => 10,
      maxContextLength: 128_000,
    };
    const events: string[] = [];
    await new RLM()
      .setProvider(mockProvider)
      .on("model:call", () => events.push("model:call"))
      .process("Test");
    expect(events).toContain("model:call");
  });
});

import { describe, it, expect } from "vitest";
import type {
  Provider,
  RecursionConfig,
  Chunk,
  RLMEvent,
} from "../src/types.js";

describe("types", () => {
  it("compiles Provider interface", () => {
    const mockProvider: Provider = {
      complete: async (prompt: string) => "response",
      countTokens: async (text: string) => 42,
      maxContextLength: 128_000,
    };
    expect(mockProvider.maxContextLength).toBe(128_000);
  });

  it("compiles RecursionConfig interface", () => {
    const config: RecursionConfig = {
      maxDepth: 3,
      chunkSize: 4000,
      concurrency: 1,
      provider: {} as Provider,
      maxCalls: undefined,
      maxCost: undefined,
    };
    expect(config.maxDepth).toBe(3);
  });

  it("compiles Chunk interface", () => {
    const chunk: Chunk = {
      index: 0,
      content: "text",
      startOffset: 0,
      endOffset: 4,
    };
    expect(chunk.index).toBe(0);
  });

  it("compiles RLMEvent interface", () => {
    const event: RLMEvent = {
      type: "chunk:split",
      data: { totalChunks: 5 },
      timestamp: Date.now(),
    };
    expect(event.type).toBe("chunk:split");
  });
});

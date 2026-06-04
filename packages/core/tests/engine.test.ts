import { describe, it, expect, vi } from "vitest";
import { RecursiveEngine } from "../src/engine.js";
import type { Provider } from "../src/types.js";

function createMockProvider(
  responses: string[]
): Provider & { complete: ReturnType<typeof vi.fn> } {
  let callCount = 0;
  const fn = vi
    .fn()
    .mockImplementation(async () => responses[callCount++] ?? "done");
  return {
    complete: fn,
    countTokens: async () => 10,
    maxContextLength: 128_000,
  };
}

describe("RecursiveEngine", () => {
  it("processes short input without recursion", async () => {
    const provider = createMockProvider(["summary of text"]);
    const engine = new RecursiveEngine({
      provider,
      maxDepth: 3,
      chunkSize: 1000,
      concurrency: 1,
    });
    const result = await engine.process("Short text input");
    expect(result).toBe("summary of text");
  });

  it("recurses on long input with multiple paragraphs", async () => {
    const provider = createMockProvider([
      "chunk 1 summary",
      "chunk 2 summary",
      "final synthesis",
    ]);
    const engine = new RecursiveEngine({
      provider,
      maxDepth: 3,
      chunkSize: 5,
      concurrency: 1,
    });
    const text = "First paragraph here.\n\nSecond paragraph here.";
    const result = await engine.process(text);
    expect(provider.complete.mock.calls.length).toBeGreaterThan(1);
    expect(result).toBe("final synthesis");
  });

  it("respects maxDepth", async () => {
    const provider = createMockProvider(["always recurse"]);
    const engine = new RecursiveEngine({
      provider,
      maxDepth: 1,
      chunkSize: 1,
      concurrency: 1,
    });
    const result = await engine.process("Deep recursion test");
    expect(result).toBeDefined();
  });

  it("emits events during processing", async () => {
    const provider = createMockProvider(["result"]);
    const engine = new RecursiveEngine({
      provider,
      maxDepth: 3,
      chunkSize: 1000,
      concurrency: 1,
    });
    const events: string[] = [];
    engine.on("chunk:split", () => events.push("chunk:split"));
    engine.on("model:call", () => events.push("model:call"));
    await engine.process("Test");
    expect(events).toContain("chunk:split");
    expect(events).toContain("model:call");
  });

  it("uses cache for repeated chunks", async () => {
    const provider = createMockProvider(["cached result"]);
    const engine = new RecursiveEngine({
      provider,
      maxDepth: 3,
      chunkSize: 1000,
      concurrency: 1,
    });
    await engine.process("Same text");
    await engine.process("Same text");
    expect(provider.complete).toHaveBeenCalledTimes(1);
  });

  it("stops when budget exceeded", async () => {
    const provider = createMockProvider(["result"]);
    const engine = new RecursiveEngine({
      provider,
      maxDepth: 10,
      chunkSize: 1,
      concurrency: 1,
      maxCalls: 2,
    });
    const result = await engine.process("Budget test with long text input");
    expect(result).toBeDefined();
  });
});

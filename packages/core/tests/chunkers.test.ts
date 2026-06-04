import { describe, it, expect } from "vitest";
import { semanticChunker } from "../src/chunkers.js";

describe("semanticChunker", () => {
  it("returns single chunk for short text", () => {
    const chunks = semanticChunker("Hello world", 100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe("Hello world");
  });

  it("splits on paragraph boundaries", () => {
    const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
    const chunks = semanticChunker(text, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].content).toContain("First");
  });

  it("assigns correct offsets", () => {
    const text = "Hello\n\nWorld";
    const chunks = semanticChunker(text, 10);
    expect(chunks[0].startOffset).toBe(0);
    expect(chunks[0].endOffset).toBe(5);
  });

  it("indexes chunks sequentially", () => {
    const text = "A\n\nB\n\nC\n\nD";
    const chunks = semanticChunker(text, 5);
    chunks.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });
});

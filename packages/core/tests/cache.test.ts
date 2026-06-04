import { describe, it, expect } from "vitest";
import { ResponseCache } from "../src/cache.js";

describe("ResponseCache", () => {
  it("returns undefined for miss", () => {
    const cache = new ResponseCache();
    expect(cache.get("unknown-key")).toBeUndefined();
  });

  it("returns cached value for hit", () => {
    const cache = new ResponseCache();
    cache.set("key", "response");
    expect(cache.get("key")).toBe("response");
  });

  it("evicts oldest entries at capacity", () => {
    const cache = new ResponseCache(2);
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe("2");
    expect(cache.get("c")).toBe("3");
  });

  it("tracks hit/miss counts", () => {
    const cache = new ResponseCache();
    cache.get("miss");
    cache.set("hit", "value");
    cache.get("hit");
    expect(cache.stats).toEqual({ hits: 1, misses: 1 });
  });
});

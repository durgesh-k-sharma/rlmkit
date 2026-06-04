import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "../src/events.js";

describe("EventEmitter", () => {
  it("subscribes and emits events", () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on("chunk:split", handler);
    emitter.emit("chunk:split", { totalChunks: 5 });
    expect(handler).toHaveBeenCalledWith({ totalChunks: 5 });
  });

  it("supports multiple subscribers", () => {
    const emitter = new EventEmitter();
    const h1 = vi.fn();
    const h2 = vi.fn();
    emitter.on("model:call", h1);
    emitter.on("model:call", h2);
    emitter.emit("model:call", { prompt: "test" });
    expect(h1).toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  it("unsubscribes correctly", () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    const unsub = emitter.on("cache:hit", handler);
    unsub();
    emitter.emit("cache:hit", {});
    expect(handler).not.toHaveBeenCalled();
  });
});

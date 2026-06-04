import type { EventType, RLMEvent } from "./types.js";

type EventHandler = (data: Record<string, unknown>) => void;

export class EventEmitter {
  private readonly listeners = new Map<EventType, Set<EventHandler>>();

  on(type: EventType, handler: EventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  emit(type: EventType, data: Record<string, unknown>): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }
}

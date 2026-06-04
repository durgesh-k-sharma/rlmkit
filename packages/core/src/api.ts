import { RecursiveEngine } from "./engine.js";
import type { Provider } from "./types.js";
import type { EventType } from "./types.js";

export interface RLmOptions {
  provider: Provider;
  maxDepth?: number;
  chunkSize?: number;
  concurrency?: number;
  maxCalls?: number;
  maxCost?: number;
}

export async function rlm(text: string, options: RLmOptions): Promise<string> {
  const engine = new RecursiveEngine({
    provider: options.provider,
    maxDepth: options.maxDepth ?? 3,
    chunkSize: options.chunkSize ?? 4000,
    concurrency: options.concurrency ?? 1,
    maxCalls: options.maxCalls,
    maxCost: options.maxCost,
  });
  return engine.process(text);
}

export class RLM {
  private provider: Provider | undefined;
  private _maxDepth = 3;
  private _chunkSize = 4000;
  private _concurrency = 1;
  private _maxCalls?: number;
  private _maxCost?: number;
  private _handlers: Array<{
    type: EventType;
    handler: (data: Record<string, unknown>) => void;
  }> = [];

  setProvider(provider: Provider): this {
    this.provider = provider;
    return this;
  }

  setMaxDepth(depth: number): this {
    this._maxDepth = depth;
    return this;
  }

  setChunkSize(size: number): this {
    this._chunkSize = size;
    return this;
  }

  setConcurrency(n: number): this {
    this._concurrency = n;
    return this;
  }

  setMaxCalls(n: number): this {
    this._maxCalls = n;
    return this;
  }

  setMaxCost(n: number): this {
    this._maxCost = n;
    return this;
  }

  on(type: EventType, handler: (data: Record<string, unknown>) => void): this {
    this._handlers.push({ type, handler });
    return this;
  }

  async process(text: string): Promise<string> {
    if (!this.provider) throw new Error("Provider not set");
    const engine = new RecursiveEngine({
      provider: this.provider,
      maxDepth: this._maxDepth,
      chunkSize: this._chunkSize,
      concurrency: this._concurrency,
      maxCalls: this._maxCalls,
      maxCost: this._maxCost,
    });
    for (const { type, handler } of this._handlers) {
      engine.on(type, handler);
    }
    return engine.process(text);
  }
}

import type { Provider, Chunk, RLMEvent, EventType } from "./types.js";

export interface EngineConfig {
  provider: Provider;
  maxDepth: number;
  chunkSize: number;
  concurrency: number;
  maxCalls?: number;
  maxCost?: number;
  chunker?: (text: string, chunkSize: number) => Chunk[];
  merger?: (results: string[]) => Promise<string>;
}

interface CacheEntry {
  response: string;
  hits: number;
}

export class RecursiveEngine {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly listeners = new Map<
    EventType,
    Set<(data: Record<string, unknown>) => void>
  >();
  private totalCalls = 0;

  constructor(private readonly config: EngineConfig) {}

  on(
    type: EventType,
    handler: (data: Record<string, unknown>) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }

  private emit(type: EventType, data: Record<string, unknown>): void {
    this.listeners.get(type)?.forEach((fn) => fn(data));
  }

  private getBudgetExceeded(): boolean {
    if (
      this.config.maxCalls !== undefined &&
      this.totalCalls >= this.config.maxCalls
    )
      return true;
    if (this.config.maxCost !== undefined) return true; // cost tracking simplified
    return false;
  }

  async process(input: string): Promise<string> {
    this.totalCalls = 0;
    return this._recurse(input, 0);
  }

  private async _recurse(text: string, depth: number): Promise<string> {
    if (this.getBudgetExceeded()) {
      this.emit("budget:exceeded", { depth, calls: this.totalCalls });
      return text;
    }

    const chunker = this.config.chunker ?? this._defaultChunker;
    const chunks = chunker(text, this.config.chunkSize);
    this.emit("chunk:split", { totalChunks: chunks.length, depth });

    if (chunks.length <= 1 || depth >= this.config.maxDepth) {
      return this._call(text, depth);
    }

    this.emit("recursion:enter", { depth, chunkCount: chunks.length });
    const results: string[] = [];
    for (const chunk of chunks) {
      if (this.getBudgetExceeded()) break;
      results.push(await this._recurse(chunk.content, depth + 1));
    }
    this.emit("recursion:exit", { depth, resultCount: results.length });

    if (results.length === 1) return results[0];
    if (this.config.merger) return this.config.merger(results);
    return this._merge(results);
  }

  private async _call(text: string, depth: number): Promise<string> {
    const cached = this.cache.get(text);
    if (cached) {
      cached.hits++;
      this.emit("cache:hit", { depth, hits: cached.hits });
      return cached.response;
    }

    this.emit("model:call", { depth, textLength: text.length });
    this.totalCalls++;
    const response = await this.config.provider.complete(text);
    this.emit("model:response", { depth, resultLength: response.length });
    this.cache.set(text, { response, hits: 0 });
    return response;
  }

  private async _merge(results: string[]): Promise<string> {
    const prompt = `Synthesize the following ${results.length} sections into a coherent output:\n\n${results.map((r, i) => `Section ${i + 1}:\n${r}`).join("\n\n")}`;
    return this._call(prompt, 0);
  }

  private _defaultChunker(text: string, chunkSize: number): Chunk[] {
    const paragraphs = text.split(/\n\n+/);
    const chunks: Chunk[] = [];
    let offset = 0;
    for (const para of paragraphs) {
      chunks.push({
        index: chunks.length,
        content: para.trim(),
        startOffset: offset,
        endOffset: offset + para.length,
      });
      offset += para.length + 2;
    }
    return chunks;
  }
}

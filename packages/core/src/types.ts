export interface Provider {
  complete(prompt: string): Promise<string>;
  countTokens(text: string): Promise<number>;
  readonly maxContextLength: number;
}

export interface Chunk {
  readonly index: number;
  readonly content: string;
  readonly startOffset: number;
  readonly endOffset: number;
}

export interface PromptHooks {
  decompose?: (chunk: Chunk, fullText: string) => string;
  shouldRecurse?: (chunk: Chunk, result: string, depth: number) => boolean;
  synthesize?: (results: string[]) => string;
}

export interface RecursionConfig {
  maxDepth: number;
  chunkSize: number;
  concurrency: number;
  provider: Provider;
  maxCalls?: number;
  maxCost?: number;
  promptHooks?: PromptHooks;
  chunker?: (text: string, chunkSize: number) => Chunk[];
  merger?: (results: string[], prompt?: string) => Promise<string>;
}

export type EventType =
  | "chunk:split"
  | "recursion:enter"
  | "recursion:exit"
  | "model:call"
  | "model:response"
  | "cache:hit"
  | "budget:exceeded";

export interface RLMEvent {
  readonly type: EventType;
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
}

export interface BudgetState {
  totalCalls: number;
  totalCost: number;
  cacheHits: number;
}

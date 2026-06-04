import type { BudgetState } from "./types.js";

export interface BudgetLimits {
  maxCalls?: number;
  maxCost?: number;
}

export class BudgetTracker {
  state: BudgetState = { totalCalls: 0, totalCost: 0, cacheHits: 0 };

  constructor(private readonly limits: BudgetLimits) {}

  recordCall(cost: number): void {
    this.state = {
      ...this.state,
      totalCalls: this.state.totalCalls + 1,
      totalCost: this.state.totalCost + cost,
    };
  }

  recordCacheHit(): void {
    this.state = { ...this.state, cacheHits: this.state.cacheHits + 1 };
  }

  get exceeded(): boolean {
    if (
      this.limits.maxCalls !== undefined &&
      this.state.totalCalls >= this.limits.maxCalls
    ) {
      return true;
    }
    if (
      this.limits.maxCost !== undefined &&
      this.state.totalCost >= this.limits.maxCost
    ) {
      return true;
    }
    return false;
  }
}

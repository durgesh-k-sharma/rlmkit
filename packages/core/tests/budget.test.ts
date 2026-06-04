import { describe, it, expect } from "vitest";
import { BudgetTracker } from "../src/budget.js";

describe("BudgetTracker", () => {
  it("starts with zero usage", () => {
    const budget = new BudgetTracker({});
    expect(budget.state.totalCalls).toBe(0);
    expect(budget.state.totalCost).toBe(0);
  });

  it("tracks calls and cost", () => {
    const budget = new BudgetTracker({ maxCalls: 10 });
    budget.recordCall(0.01);
    budget.recordCall(0.02);
    expect(budget.state.totalCalls).toBe(2);
    expect(budget.state.totalCost).toBeCloseTo(0.03);
  });

  it("exceeded when maxCalls reached", () => {
    const budget = new BudgetTracker({ maxCalls: 2 });
    budget.recordCall(0.01);
    expect(budget.exceeded).toBe(false);
    budget.recordCall(0.01);
    expect(budget.exceeded).toBe(true);
  });

  it("exceeded when maxCost reached", () => {
    const budget = new BudgetTracker({ maxCost: 0.05 });
    budget.recordCall(0.03);
    expect(budget.exceeded).toBe(false);
    budget.recordCall(0.03);
    expect(budget.exceeded).toBe(true);
  });

  it("not exceeded when no limits set", () => {
    const budget = new BudgetTracker({});
    budget.recordCall(999);
    expect(budget.exceeded).toBe(false);
  });
});

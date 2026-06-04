import { describe, it, expect } from "vitest";

describe("CLI", () => {
  it("exports run function", async () => {
    const { run } = await import("../src/cli.js");
    expect(typeof run).toBe("function");
  });
});

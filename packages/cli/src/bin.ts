#!/usr/bin/env node
import { run } from "./cli.js";

const args = process.argv.slice(2);
const input = args[0];

if (!input) {
  console.error(
    "Usage: rlmkit <text|file> [--provider openai|anthropic|openrouter] [--api-key KEY] [--max-depth 3] [--chunk-size 4000] [--max-calls N] [--max-cost N] [--verbose]"
  );
  process.exit(1);
}

const getArg = (flag: string, fallback?: string): string | undefined => {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return fallback;
};

const options = {
  provider: (getArg("--provider", "openai") ?? "openai") as
    | "openai"
    | "anthropic"
    | "openrouter",
  apiKey:
    getArg("--api-key") ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    "",
  maxDepth: parseInt(getArg("--max-depth", "3") ?? "3", 10),
  chunkSize: parseInt(getArg("--chunk-size", "4000") ?? "4000", 10),
  maxCalls: getArg("--max-calls")
    ? parseInt(getArg("--max-calls")!, 10)
    : undefined,
  maxCost: getArg("--max-cost") ? parseFloat(getArg("--max-cost")!) : undefined,
  verbose: args.includes("--verbose") || args.includes("-v"),
  stream: args.includes("--stream") || args.includes("-s"),
};

run(input, options)
  .then((result) => {
    console.log(result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });

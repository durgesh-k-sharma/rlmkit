import {
  rlm,
  createOpenAIProvider,
  createAnthropicProvider,
  createOpenRouterProvider,
} from "@rlmkit/core";
import { readFileSync, existsSync } from "node:fs";

export interface CLIOptions {
  provider: "openai" | "anthropic" | "openrouter";
  apiKey: string;
  maxDepth: number;
  chunkSize: number;
  maxCalls?: number;
  maxCost?: number;
  verbose: boolean;
  stream: boolean;
}

export async function run(input: string, options: CLIOptions): Promise<string> {
  if (options.verbose) {
    console.error(`Processing: ${input}`);
    console.error(
      `Provider: ${options.provider}, MaxDepth: ${options.maxDepth}`
    );
  }

  const text = existsSync(input) ? readFileSync(input, "utf-8") : input;

  const complete = async (prompt: string): Promise<string> => {
    switch (options.provider) {
      case "openai":
        return openaiComplete(prompt, options.apiKey);
      case "anthropic":
        return anthropicComplete(prompt, options.apiKey);
      case "openrouter":
        return openrouterComplete(prompt, options.apiKey);
    }
  };

  const provider = {
    complete,
    countTokens: async (t: string) => Math.ceil(t.length / 4),
    maxContextLength: options.provider === "anthropic" ? 200_000 : 128_000,
  };

  return rlm(text, {
    provider,
    maxDepth: options.maxDepth,
    chunkSize: options.chunkSize,
    maxCalls: options.maxCalls,
    maxCost: options.maxCost,
  });
}

async function openaiComplete(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

async function anthropicComplete(
  prompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content[0].text;
}

async function openrouterComplete(
  prompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "auto",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

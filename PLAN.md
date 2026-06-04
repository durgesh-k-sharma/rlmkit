# RLMKit v1 — Recursive Language Models Developer Tool

## Paper

**Recursive Language Models** — arXiv:2512.24601
Alex L. Zhang, Tim Kraska, Omar Khattab

Key insight: LLMs process arbitrarily long prompts by treating them as an external environment, recursively calling themselves over prompt snippets. Scales 2x beyond context windows, beats GPT-5/Claude Code on long-context tasks.

## Project Identity

- **Name:** rlmkit
- **npm:** `rlmkit`
- **GitHub:** `durgesh-k-sharma/rlmkit`
- **License:** Dual MIT/Apache 2.0
- **Language:** TypeScript only
- **Structure:** Monorepo with npm workspaces

## Architecture

### Monorepo Structure

```
rlmkit/
  packages/
    core/          # Recursive engine, provider adapters, events, caching
    cli/           # CLI tool (rlmkit command)
    api/           # Hosted API service (v1.1)
    vscode-ext/    # VS Code extension (v1.2)
  tsconfig.base.json
  package.json     # workspace root
```

### Core Library (`packages/core`)

The heart of the tool. Everything else builds on this.

**Recursive Loop (Hybrid control flow):**

- Developer sets `maxDepth` and `chunkSize` as guardrails
- Model controls what to explore within those bounds
- Configurable `concurrency` (default: sequential)
- Circuit breaker stops recursion on runaway loops

**Provider System (Provider-agnostic):**

- `Provider` interface: `complete()`, `countTokens()`, `maxContextLength()`
- Built-in adapters: OpenAI, Anthropic, OpenRouter
- Documented interface for community adapters (Ollama, Together, Groq)

**Chunking (Configurable):**

- Default: semantic chunking (paragraphs/headings for prose, function/class boundaries for code)
- Override: custom `chunker` function

**Merger (Configurable):**

- Default: LLM synthesis pass (highest quality, matches paper)
- Override: custom `merger` function (concatenation, voting, ranking, hierarchical)

**Observability (Structured events):**

- Events: `chunk:split`, `recursion:enter`, `recursion:exit`, `model:call`, `model:response`, `cache:hit`, `budget:exceeded`
- Developers subscribe and build their own observability
- CLI flag consumes events for console output

**Caching + Budget Controls:**

- Response cache by input hash (same chunk + prompt = skip API call)
- Budget controls: `maxCost`, `maxCalls` with circuit breaker

**Error Handling (Retry + Circuit Breaker + Fallback):**

- Exponential backoff retry (max 3)
- Circuit breaker after N consecutive failures
- Failover to secondary provider

**Prompt System (Template with hooks):**

- Default prompt implements paper's RLM paradigm
- `promptHooks` config for overriding decomposition instructions, stop conditions

**Input System:**

- Accept strings, file paths, or glob patterns (`src/**/*.ts`, `docs/**/*.md`)
- Auto-reads and concatenates files before recursive processing

### Developer API

**Simple function (80% case):**

```ts
import { rlm } from "rlmkit";

const result = await rlm(longText, {
  maxDepth: 3,
  chunkSize: 4000,
  provider: openai,
});
```

**Builder pattern (power users):**

```ts
import { RLM } from "rlmkit";

const result = await new RLM()
  .setMaxDepth(3)
  .setChunkSize(4000)
  .setProvider(openai)
  .setConcurrency(5)
  .setMaxCost(0.5)
  .on("recursion:enter", (e) => console.log(`Depth: ${e.depth}`))
  .process(longText);
```

**Glob input:**

```ts
const result = await rlm("docs/**/*.md", { provider: openai });
const result = await rlm("src/**/*.ts", { maxDepth: 5, chunkSize: 2000 });
```

### CLI (`packages/cli`)

```bash
# Process a file
rlmkit process paper.pdf --max-depth 3 --provider openai

# Process with glob
rlmkit process "docs/**/*.md" --max-depth 5 --verbose

# With budget control
rlmkit process large-doc.txt --max-cost 1.00 --max-calls 200

# Streaming output
rlmkit process codebase/ --stream --format json
```

## Testing Strategy (Full test pyramid)

- **Unit tests:** Mocked providers, chunking logic, recursion control flow, event emission
- **Integration tests:** VCR-captured provider fixtures (record once, replay forever)
- **Property-based tests:** Termination guarantees ("recursion always terminates within maxDepth")
- **E2E tests:** CLI and API endpoints
- **Framework:** vitest

## Documentation

- **README:** Quickstart, API reference, architecture overview
- **Docs site:** VitePress (TS-native, fast)
- **Interactive examples:** Embedded StackBlitz/Playground — try without installing
- **Video walkthrough:** Ship after v1 (record 10-min demo on real inputs)

## V1 Shipping Scope

**Ship:** Core library + CLI
**Defer to v1.1:** API service
**Defer to v1.2:** VS Code extension

## Key Risks

1. **Runaway recursion** — mitigated by maxDepth guardrail + circuit breaker + budget controls
2. **Provider API changes** — mitigated by provider-agnostic interface + adapter pattern
3. **Cost overruns** — mitigated by caching + budget controls + circuit breaker
4. **Chunking quality** — mitigated by semantic default + configurable chunker
5. **Synthesis quality** — mitigated by LLM synthesis default + configurable merger

## Constraints

- TypeScript only (no Rust, no Python)
- I/O-bound workload (LLM API calls), not CPU-bound
- Must work with any OpenAI-compatible API
- npm package name must be available (rlmkit confirmed available)
- rlmx stays independent — no breaking changes to existing project

## Dependencies

- Existing rlmx project stays as-is (published, working)
- No dependency on rlmx code
- Can reference rlmx README as "predecessor"

## Action Items (v1)

1. Create GitHub repo: durgesh-k-sharma/rlmkit
2. Set up monorepo with npm workspaces
3. Implement Provider interface + OpenAI/Anthropic/OpenRouter adapters
4. Implement recursive engine with hybrid control flow
5. Implement semantic chunking (default) + custom chunker support
6. Implement LLM synthesis merger (default) + custom merger support
7. Implement structured event system
8. Implement response cache + budget controls + circuit breaker
9. Implement retry + fallback provider logic
10. Implement prompt template with hooks
11. Implement input system (string/file/glob)
12. Implement simple function API + builder pattern API
13. Build CLI with verbose, streaming, budget flags
14. Write full test pyramid (unit, integration, property, e2E)
15. Write README + VitePress docs site + interactive examples
16. Publish rlmkit to npm
17. Dual-license MIT/Apache 2.0

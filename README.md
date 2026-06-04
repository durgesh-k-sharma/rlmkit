# RLMKit — Recursive Language Models for Developers

> TypeScript toolkit implementing [Recursive Language Models (arXiv:2512.24601)](https://arxiv.org/abs/2512.24601).

## Quick Start

```bash
npm install rlmkit
```

```ts
import { rlm } from "rlmkit";
import OpenAI from "openai";

const openai = new OpenAI();
const result = await rlm("path/to/large-document.md", {
  provider: {
    /* ... */
  },
  maxDepth: 3,
  chunkSize: 4000,
});
```

## Packages

| Package        | Description                 |
| -------------- | --------------------------- |
| `@rlmkit/core` | Core recursive engine       |
| `@rlmkit/cli`  | CLI tool (`rlmkit` command) |

## License

Dual MIT/Apache 2.0

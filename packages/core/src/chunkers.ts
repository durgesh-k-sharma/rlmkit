import type { Chunk } from "./types.js";

export function semanticChunker(text: string, chunkSize: number): Chunk[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: Chunk[] = [];
  let offset = 0;

  for (const para of paragraphs) {
    if (para.length <= chunkSize) {
      chunks.push({
        index: chunks.length,
        content: para.trim(),
        startOffset: offset,
        endOffset: offset + para.length,
      });
      offset += para.length + 2;
    } else {
      const sentences = para.split(/(?<=[.!?])\s+/);
      let currentBatch = "";
      let batchStart = offset;

      for (const sentence of sentences) {
        if (
          (currentBatch + sentence).length > chunkSize &&
          currentBatch.length > 0
        ) {
          chunks.push({
            index: chunks.length,
            content: currentBatch.trim(),
            startOffset: batchStart,
            endOffset: batchStart + currentBatch.length,
          });
          batchStart += currentBatch.length + 1;
          currentBatch = sentence + " ";
        } else {
          currentBatch += sentence + " ";
        }
      }

      if (currentBatch.trim()) {
        chunks.push({
          index: chunks.length,
          content: currentBatch.trim(),
          startOffset: batchStart,
          endOffset: batchStart + currentBatch.length,
        });
      }

      offset += para.length + 2;
    }
  }

  return chunks;
}

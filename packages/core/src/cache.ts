export class ResponseCache {
  private readonly store = new Map<string, string>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly maxSize: number = 100) {}

  get(key: string): string | undefined {
    const value = this.store.get(key);
    if (value !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }
    return value;
  }

  set(key: string, value: string): void {
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, value);
  }

  get stats() {
    return { hits: this.hits, misses: this.misses };
  }
}

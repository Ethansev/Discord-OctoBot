export class Cooldown {
  private readonly timestamps = new Map<string, number>();

  constructor(
    private readonly cooldownMs: number,
    private readonly now: () => number = Date.now
  ) {}

  isOnCooldown(key: string): boolean {
    const last = this.timestamps.get(key);
    return last !== undefined && this.now() - last < this.cooldownMs;
  }

  mark(key: string): void {
    this.timestamps.set(key, this.now());
  }
}

export function truncateForPrompt(input: string, maxChars: number): string {
  if (input.length <= maxChars) return input;
  return input.slice(-maxChars);
}

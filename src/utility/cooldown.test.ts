import { describe, expect, test } from 'vitest';
import { Cooldown, truncateForPrompt } from './cooldown.js';

describe('Cooldown', () => {
  test('first call is not on cooldown', () => {
    const cd = new Cooldown(1000);
    expect(cd.isOnCooldown('user1')).toBe(false);
  });

  test('after mark, key is on cooldown', () => {
    let t = 1000;
    const cd = new Cooldown(1000, () => t);
    cd.mark('user1');
    expect(cd.isOnCooldown('user1')).toBe(true);
  });

  test('after cooldown elapses, key is no longer on cooldown', () => {
    let t = 1000;
    const cd = new Cooldown(1000, () => t);
    cd.mark('user1');
    t = 2001;
    expect(cd.isOnCooldown('user1')).toBe(false);
  });

  test('cooldowns are scoped per-key', () => {
    let t = 1000;
    const cd = new Cooldown(1000, () => t);
    cd.mark('user1');
    expect(cd.isOnCooldown('user1')).toBe(true);
    expect(cd.isOnCooldown('user2')).toBe(false);
  });

  test('boundary: exactly at cooldownMs is no longer on cooldown', () => {
    let t = 1000;
    const cd = new Cooldown(1000, () => t);
    cd.mark('user1');
    t = 2000;
    expect(cd.isOnCooldown('user1')).toBe(false);
  });
});

describe('truncateForPrompt', () => {
  test('returns input unchanged when shorter than max', () => {
    expect(truncateForPrompt('hello', 100)).toBe('hello');
  });

  test('returns input unchanged when exactly at max', () => {
    expect(truncateForPrompt('hello', 5)).toBe('hello');
  });

  test('keeps tail when longer than max', () => {
    expect(truncateForPrompt('abcdefghij', 4)).toBe('ghij');
  });

  test('handles empty string', () => {
    expect(truncateForPrompt('', 10)).toBe('');
  });
});

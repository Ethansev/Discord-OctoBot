import { describe, expect, test } from 'vitest';
import { findYourMomTrigger } from './triggers.js';

describe('findYourMomTrigger', () => {
  test.each([
    'your mom',
    'YO MOMMA',
    'tell my mum',
    'mama mia',
    'love you mommy',
    'mother of dragons',
  ])('matches: %s', (input) => {
    expect(findYourMomTrigger(input)).toBeDefined();
  });

  test.each([
    'momentum is real',
    'a moment ago',
    'mombasa kenya',
    'hello world',
    '',
  ])('does not match: %s', (input) => {
    expect(findYourMomTrigger(input)).toBeUndefined();
  });

  test('handles tabs and multiple spaces', () => {
    expect(findYourMomTrigger('hey   mom\tplease')).toBeDefined();
  });
});

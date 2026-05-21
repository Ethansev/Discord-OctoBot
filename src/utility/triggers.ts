const YOUR_MOM_TRIGGERS = new Set([
  'mommy',
  'mother',
  'mama',
  'momma',
  'mom',
  'mamma',
  'mum',
]);

export function findYourMomTrigger(content: string): string | undefined {
  for (const word of content.split(/\s+/)) {
    if (YOUR_MOM_TRIGGERS.has(word.toLowerCase())) {
      return word;
    }
  }
  return undefined;
}

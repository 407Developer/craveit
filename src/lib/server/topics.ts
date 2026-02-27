export const TOPIC_QUERIES: Record<string, string[]> = {
  tech: ['technology news', 'software engineering', 'developer tools'],
  'tech updates': ['tech updates', 'AI research', 'startup news'],
  'hobby project': ['maker projects', 'side projects', 'indie hacking'],
  politics: ['public policy', 'election updates', 'government regulation']
};

export function buildQueries(categories: string[]) {
  if (categories.length === 0) {
    return ['technology news', 'developer tools', 'policy updates'];
  }
  const queries = categories.flatMap((category) => TOPIC_QUERIES[category] ?? [category]);
  return Array.from(new Set(queries));
}

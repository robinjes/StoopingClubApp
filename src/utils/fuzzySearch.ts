function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarity(a: string, b: string): number {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    return shorter / longer;
  }

  const maxLength = Math.max(left.length, right.length);
  return 1 - levenshteinDistance(left, right) / maxLength;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getWords(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((word) => word.length > 0);
}

function fuzzyTokenScore(token: string, candidates: string[]): number {
  let best = 0;

  for (const candidate of candidates) {
    if (candidate === token) {
      return 1;
    }

    if (candidate.includes(token) || token.includes(candidate)) {
      best = Math.max(best, 0.88);
      continue;
    }

    if (token.length < 3) {
      continue;
    }

    const candidateWords = candidate.split(' ');
    for (const word of candidateWords) {
      if (word.length < 2) {
        continue;
      }

      const score = similarity(token, word);
      if (score >= 0.72) {
        best = Math.max(best, score);
      }
    }

    const wholeScore = similarity(token, candidate);
    if (wholeScore >= 0.72) {
      best = Math.max(best, wholeScore);
    }
  }

  return best;
}

export type SearchableProduct = {
  title: string;
  description: string;
  handle: string;
  tags: string[];
};

export function scoreProductMatch(product: SearchableProduct, query: string): number {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return 1;
  }

  const title = normalize(product.title);
  const description = normalize(stripHtml(product.description));
  const handle = normalize(product.handle);
  const tags = product.tags.map((tag) => normalize(tag));
  const tokens = normalizedQuery.split(' ').filter((token) => token.length > 0);

  const titleWords = getWords(product.title);
  const tagWords = product.tags.flatMap((tag) => getWords(tag));
  const allWords = [...titleWords, ...tagWords, ...getWords(handle)];

  let score = 0;

  if (title.includes(normalizedQuery)) {
    score += 1;
  } else {
    const phraseScore = fuzzyTokenScore(normalizedQuery, [title, ...tags, handle]);
    score += phraseScore * 0.85;
  }

  for (const token of tokens) {
    let tokenScore = 0;

    if (title.includes(token)) {
      tokenScore = Math.max(tokenScore, 0.95);
    }

    if (tags.some((tag) => tag.includes(token))) {
      tokenScore = Math.max(tokenScore, 0.82);
    }

    if (handle.includes(token)) {
      tokenScore = Math.max(tokenScore, 0.78);
    }

    if (description.includes(token)) {
      tokenScore = Math.max(tokenScore, 0.55);
    }

    const fuzzyScore = fuzzyTokenScore(token, [title, ...tags, handle, ...allWords]);
    tokenScore = Math.max(tokenScore, fuzzyScore * 0.9);

    score += tokenScore;
  }

  const averageTokenScore = tokens.length > 0 ? score / tokens.length : score;
  const matchedTokens = tokens.filter((token) => {
    return (
      title.includes(token) ||
      tags.some((tag) => tag.includes(token)) ||
      fuzzyTokenScore(token, [title, ...tags, handle, ...allWords]) >= 0.72
    );
  }).length;

  if (tokens.length > 1 && matchedTokens < Math.ceil(tokens.length / 2)) {
    return averageTokenScore * 0.45;
  }

  return averageTokenScore;
}

export function matchesProductSearch(product: SearchableProduct, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return true;
  }

  return scoreProductMatch(product, normalizedQuery) >= 0.42;
}

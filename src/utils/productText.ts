export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getOriginStory(description: string): string {
  const plain = stripHtml(description);
  const firstSentence = plain.split(/[.!?]/)[0]?.trim();

  if (!firstSentence) {
    return 'A neighborhood find waiting for its next home.';
  }

  return firstSentence.length > 120 ? `${firstSentence.slice(0, 117)}...` : firstSentence;
}

export function getProductCondition(description: string): string | null {
  const plain = stripHtml(description);
  const match = plain.match(/condition\s*:\s*([^.\n]+)/i);
  const value = match?.[1]?.trim();
  return value ? value.toLowerCase() : null;
}

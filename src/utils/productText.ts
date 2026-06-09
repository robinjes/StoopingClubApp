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

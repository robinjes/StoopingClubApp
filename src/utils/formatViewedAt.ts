export function formatViewedAt(viewedAt: string | null | undefined): string | null {
  if (!viewedAt) {
    return null;
  }

  const viewedDate = new Date(viewedAt);
  if (Number.isNaN(viewedDate.getTime())) {
    return null;
  }

  const now = new Date();
  const diffMs = now.getTime() - viewedDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'Viewed just now';
  }

  if (diffMinutes < 60) {
    return `Viewed ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Viewed ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `Viewed ${diffDays}d ago`;
  }

  return `Viewed ${viewedDate.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

export function parseLocalDate(dateString: string): Date {
  return new Date(`${dateString}T12:00:00`);
}

export function addDaysToDateString(dateString: string, delta: number): string {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + delta);
  return getLocalDateString(date);
}

export function daysBetweenDateStrings(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseLocalDate(to).getTime() - parseLocalDate(from).getTime()) / msPerDay);
}

/** Dates strictly between two date strings, oldest first. */
export function getDatesBetween(startExclusive: string, endExclusive: string): string[] {
  const dates: string[] = [];
  let cursor = addDaysToDateString(startExclusive, 1);

  while (cursor < endExclusive && dates.length < 400) {
    dates.push(cursor);
    cursor = addDaysToDateString(cursor, 1);
  }

  return dates;
}

/**
 * Walks backwards from the most recent open day and collects only the dates
 * that belong to the current unbroken run (opened days plus frozen days).
 */
export function getCurrentRunDates(
  lastOpenDate: string | null,
  activeDates: string[],
  frozenDates: string[],
): { active: Set<string>; frozen: Set<string> } {
  const active = new Set<string>();
  const frozen = new Set<string>();

  if (!lastOpenDate) {
    return { active, frozen };
  }

  const activeSet = new Set(activeDates);
  const frozenSet = new Set(frozenDates);
  let cursor = lastOpenDate;
  let guard = 0;

  while (guard < 800 && (activeSet.has(cursor) || frozenSet.has(cursor))) {
    if (activeSet.has(cursor)) {
      active.add(cursor);
    } else {
      frozen.add(cursor);
    }
    cursor = addDaysToDateString(cursor, -1);
    guard += 1;
  }

  return { active, frozen };
}

export function getMonthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function getCalendarDays(year: number, monthIndex: number): Array<number | null> {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  return cells;
}

export function toDateKey(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, '0');
  const dayString = String(day).padStart(2, '0');
  return `${year}-${month}-${dayString}`;
}

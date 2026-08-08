/**
 * Calendar date helpers shared by /api/cards/calendar and /api/dashboard/summary.
 *
 * Both routes previously carried their own byte-identical copy of this logic, with two bugs:
 *
 *  1. Mixed time zones. The source date was read with LOCAL getters (`getMonth()`,
 *     `getDate()`) and then rebuilt with `Date.UTC(...)`. On a server west of UTC an event
 *     stored as `2026-03-01T00:00:00Z` reads back as Feb 28 locally, so the recurrence landed
 *     a day early. Everything here reads and writes in UTC.
 *
 *  2. Month overflow. `Date.UTC(y, m, 31)` silently rolls forward, so a monthly event on the
 *     31st appeared on Mar 3 in February. Day-of-month is now clamped to the target month.
 */

const DAY_MS = 86_400_000;

/** Last valid day number of a given UTC month. */
function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Builds a UTC noon timestamp, clamping the day to the target month's length. */
function utcNoonClamped(year: number, month: number, day: number): Date {
  // Normalise month overflow (e.g. month = 12 -> January of the next year) before clamping.
  const normalisedYear = year + Math.floor(month / 12);
  const normalisedMonth = ((month % 12) + 12) % 12;
  const clampedDay = Math.min(day, daysInUtcMonth(normalisedYear, normalisedMonth));
  return new Date(Date.UTC(normalisedYear, normalisedMonth, clampedDay, 12, 0, 0));
}

export interface RecurringEvent {
  event_date: string;
  recurrence?: string | null;
}

/**
 * Returns the next occurrence of a recurring event as an ISO string, or the original date for
 * non-recurring events. An occurrence counts as "still upcoming" until a day after it passes,
 * matching the previous behaviour.
 */
export function expandRecurrence<T extends RecurringEvent>(event: T, now: Date = new Date()): T {
  if (event.recurrence !== "yearly" && event.recurrence !== "monthly") {
    return event;
  }

  const original = new Date(event.event_date);
  if (Number.isNaN(original.getTime())) {
    // Unparseable stored date, leave it untouched rather than emitting an Invalid Date.
    return event;
  }

  const dayOfMonth = original.getUTCDate();
  let targetYear = now.getUTCFullYear();
  let targetMonth = event.recurrence === "yearly" ? original.getUTCMonth() : now.getUTCMonth();

  let targetDate = utcNoonClamped(targetYear, targetMonth, dayOfMonth);

  // Already passed this cycle, roll to the next one.
  if (targetDate.getTime() < now.getTime() - DAY_MS) {
    if (event.recurrence === "yearly") {
      targetYear += 1;
    } else {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }
    targetDate = utcNoonClamped(targetYear, targetMonth, dayOfMonth);
  }

  return { ...event, event_date: targetDate.toISOString() };
}

/**
 * Resolves a "First Monday in September"-style rule to a concrete date in `year`.
 * Returns null when the rule doesn't match the supported grammar, so callers can skip the
 * event instead of silently pinning it to January 1st.
 */
export function calculateDynamicDate(rule: string, year: number): Date | null {
  const match = rule
    .trim()
    .match(
      /^(First|Second|Third|Fourth|Last)\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+in\s+(January|February|March|April|May|June|July|August|September|October|November|December)$/i
    );
  if (!match) return null;

  const [, occurrence, dayName, monthName] = match;
  const monthMap: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  };

  const month = monthMap[monthName.toLowerCase()];
  const targetDayOfWeek = dayMap[dayName.toLowerCase()];

  // Collect matching weekdays in UTC, the old version used local-time Date construction and
  // could pick the wrong day near month boundaries.
  const dates: Date[] = [];
  const lastDay = daysInUtcMonth(year, month);
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(Date.UTC(year, month, d, 12, 0, 0));
    if (date.getUTCDay() === targetDayOfWeek) dates.push(date);
  }
  if (dates.length === 0) return null;

  switch (occurrence.toLowerCase()) {
    case "first":
      return dates[0];
    case "second":
      return dates[1] ?? null;
    case "third":
      return dates[2] ?? null;
    case "fourth":
      return dates[3] ?? null;
    case "last":
      return dates[dates.length - 1];
    default:
      return null;
  }
}

export interface GlobalEventRow {
  month: number | null;
  day: number | null;
  rule: string | null;
}

/**
 * Resolves a global holiday row to an ISO date for `year`, or null when it is not resolvable.
 * `month` is 1-based in the database.
 */
export function getGlobalEventDate(event: GlobalEventRow, year: number): string | null {
  if (event.month !== null && event.day !== null) {
    // Guard the range: month = 0 used to produce December of the *previous* year, because
    // `month - 1` underflowed.
    if (event.month < 1 || event.month > 12 || event.day < 1 || event.day > 31) return null;
    return utcNoonClamped(year, event.month - 1, event.day).toISOString();
  }

  if (event.rule) {
    const date = calculateDynamicDate(event.rule, year);
    return date ? date.toISOString() : null;
  }

  return null;
}

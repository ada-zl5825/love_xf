/**
 * Calculate the number of full days between two dates.
 * Defaults `to` to the current moment.
 */
export function daysBetween(
  from: string | Date,
  to: string | Date = new Date(),
): number {
  const start = new Date(from);
  const end = new Date(to);
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * Break the elapsed time since `from` into days / hours / minutes / seconds.
 * Used by the /together countdown timer.
 */
export function timeSince(from: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const start = new Date(from);
  const totalSeconds = Math.max(
    0,
    Math.floor((Date.now() - start.getTime()) / 1000),
  );

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

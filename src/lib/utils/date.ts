export const APP_TIMEZONE = "Europe/Istanbul";

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** GG.AA.YYYY, Europe/Istanbul saat dilimine göre. */
export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIMEZONE,
  }).format(toDate(value));
}

/** GG.AA.YYYY HH:mm, Europe/Istanbul saat dilimine göre. */
export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return `${formatDate(date)} ${formatTime(date)}`;
}

/** HH:mm, Europe/Istanbul saat dilimine göre. */
export function formatTime(value: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIMEZONE,
  }).format(toDate(value));
}

/** Bugünün tarihi, Europe/Istanbul saat dilimine göre, `date` kolonlarına yazılabilecek YYYY-AA-GG formatında. */
export function todayIstanbulISODate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: APP_TIMEZONE,
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

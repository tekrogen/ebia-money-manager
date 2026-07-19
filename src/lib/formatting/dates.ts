export function formatDateShort(
  isoDate: string,
  locale = "en-US",
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateRange(
  startIso: string,
  endIso: string,
  locale = "en-US",
): string {
  return `${formatDateShort(startIso, locale)} – ${formatDateShort(endIso, locale)}`;
}

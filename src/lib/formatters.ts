export function formatDisplayAmount(value: number) {
  // A payout that came back as null or an empty decimal reaches this as NaN, and
  // Intl renders that as the literal text "NaN" in the middle of a money column.
  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatRelativeDate(value: Date) {
  // `Intl.DateTimeFormat.format` throws RangeError on an Invalid Date, so one bad
  // timestamp in the event log took the whole page down instead of one row.
  if (Number.isNaN(value?.getTime?.() ?? Number.NaN)) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function shortenAddress(value: string) {
  if (!value) {
    return "Unavailable";
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

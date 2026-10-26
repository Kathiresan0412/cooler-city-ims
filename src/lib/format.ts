export function formatCurrency(value: number | string | null | undefined, currency = "LKR") {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {style: "currency",currency,}).format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(date);
}

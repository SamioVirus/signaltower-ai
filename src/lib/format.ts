const currency = (notation: "standard" | "compact") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation,
    maximumFractionDigits: notation === "compact" ? 1 : 0,
  });

export const formatCurrency = (value: number): string =>
  currency("standard").format(value);

export const formatCompactCurrency = (value: number): string =>
  currency("compact").format(value);

export const formatPercent = (value: number, fractionDigits = 0): string =>
  `${value.toFixed(fractionDigits)}%`;

export const formatDays = (value: number): string => {
  const rounded = Math.round(value);
  return `${rounded} ${rounded === 1 ? "day" : "days"}`;
};

export const formatWeeks = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${rounded === 1 ? "week" : "weeks"}`;
};

export const formatCount = (
  value: number,
  singular: string,
  plural = `${singular}s`,
): string => `${value} ${value === 1 ? singular : plural}`;

/** Points of readiness score, signed, for the score explainer. */
export const formatPoints = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "-" : ""}${Math.abs(rounded).toFixed(1)} pts`;
};

import type { ComponentProps } from "react";
import type { Tooltip } from "recharts";

import { useIsDark } from "@/hooks/useIsDark";

/**
 * Chart theming.
 *
 * Colours are concrete hex values selected by theme rather than CSS custom
 * properties: `var()` is not resolved inside SVG presentation attributes such
 * as `fill` and `stroke`, so a chart written against tokens renders no marks
 * at all. The tokens still drive everything outside the plot area.
 *
 * Both columns are the same hues stepped for their own surface, and both are
 * re-validated on every run of `npm run palette` for colour-vision separation
 * and surface contrast. Categorical slots are assigned in fixed order and never
 * cycled, so a series keeps its colour when a filter removes its neighbours.
 *
 * Petrol — the interface accent — is deliberately absent from these series. A
 * mark inside a plot must never be mistaken for the interaction colour, so
 * in-chart emphasis uses weight, opacity or an annotation instead of a hue.
 */

export interface ChartPalette {
  /** Categorical slots, in fixed assignment order. */
  series: readonly [string, string, string];
  /** Single-hue ramp for ordered tiers, light to dark. */
  ordinal: readonly [string, string, string, string];
  grid: string;
  axis: string;
  surface: string;
  border: string;
  text: string;
}

const LIGHT: ChartPalette = {
  series: ["#33409b", "#b24a18", "#12705a"],
  ordinal: ["#8fb4d4", "#6e9bc8", "#3c72aa", "#1f4e7a"],
  grid: "#dadfd9",
  axis: "#5f6b72",
  surface: "#fffefb",
  border: "#c3cabf",
  text: "#20272b",
};

const DARK: ChartPalette = {
  series: ["#6f84e0", "#e0793f", "#3fae8c"],
  ordinal: ["#8fb4d4", "#6e9bc8", "#3c72aa", "#24578a"],
  grid: "#2b3437",
  axis: "#949996",
  surface: "#1b2225",
  border: "#3d4a4e",
  text: "#e9e7e1",
};

export const useChartPalette = (): ChartPalette => (useIsDark() ? DARK : LIGHT);

/** Tooltip styling, spread onto every Recharts `<Tooltip />`. */
export const useChartTooltip = () => {
  const palette = useChartPalette();
  return {
    cursor: { fill: `${palette.series[0]}14` },
    contentStyle: {
      backgroundColor: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: "0.6rem",
      boxShadow: "var(--shadow-raised)",
      fontSize: "0.8125rem",
      padding: "0.5rem 0.75rem",
    },
    labelStyle: {
      color: palette.text,
      fontWeight: 600,
      marginBottom: "0.25rem",
    },
    itemStyle: { color: palette.axis },
  } as const;
};

/**
 * Recharts types its tooltip callbacks over a wide union that does not narrow
 * at the call site. These two helpers absorb that in one place so every chart
 * can be written against the shape its own data actually has.
 */
type TooltipProps = ComponentProps<typeof Tooltip>;

export const tooltipFormatter = <TPayload>(
  render: (
    value: number,
    payload: TPayload,
    seriesKey: string,
  ) => [string, string],
): TooltipProps["formatter"] =>
  ((value: unknown, name: unknown, item: { payload?: TPayload } | undefined) =>
    render(
      Number(value ?? 0),
      item?.payload as TPayload,
      String(name ?? ""),
    )) as TooltipProps["formatter"];

export const tooltipLabel = (
  render: (label: string) => string,
): TooltipProps["labelFormatter"] =>
  ((label: unknown) =>
    render(String(label ?? ""))) as TooltipProps["labelFormatter"];

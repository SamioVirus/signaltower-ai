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
 * Both columns are the same hues stepped for their own surface, and both were
 * validated for colour-vision separation, lightness band and surface contrast.
 * Categorical slots are assigned in fixed order and never cycled, so a series
 * keeps its colour when a filter removes its neighbours.
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
  series: ["#2a78d6", "#eb6834", "#1baf7a"],
  ordinal: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"],
  grid: "#e2e8f0",
  axis: "#64748b",
  surface: "#ffffff",
  border: "#cbd5e1",
  text: "#0f172a",
};

const DARK: ChartPalette = {
  series: ["#3987e5", "#d95926", "#199e70"],
  ordinal: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"],
  grid: "#232936",
  axis: "#818c9f",
  surface: "#171b25",
  border: "#333c4d",
  text: "#f1f5f9",
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

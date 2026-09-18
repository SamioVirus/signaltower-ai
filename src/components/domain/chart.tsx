import type { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

/** Chart chrome. Theming and tooltip helpers live in `@/lib/chart-theme`. */

/**
 * Fixed-height responsive wrapper.
 *
 * ResponsiveContainer needs a bounded parent or it collapses to zero height on
 * first paint, which is a class of bug worth removing once rather than
 * rediscovering per chart.
 */
export const ChartFrame = ({
  height,
  children,
}: {
  height: number;
  children: ReactElement;
}) => (
  <div style={{ height }} className="w-full">
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

/** Legend row. Present whenever two or more series share an axis. */
export const ChartLegend = ({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) => (
  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
    {items.map((item) => (
      <li
        key={item.label}
        className="flex items-center gap-2 text-xs text-secondary"
      >
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: item.color }}
          aria-hidden="true"
        />
        {item.label}
      </li>
    ))}
  </ul>
);

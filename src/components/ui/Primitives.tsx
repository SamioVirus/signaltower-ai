import type {
  ButtonHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Shared building blocks. Everything here is presentational.
 *
 * SURFACE HIERARCHY — the rule this file exists to enforce.
 *
 * The previous system gave every container the same border, radius and shadow,
 * so a metric tile, a filter row, a chart and a leadership decision all carried
 * identical weight. Ninety containers, one treatment, no hierarchy.
 *
 * There are now three tiers, and a component must pick one:
 *
 *   Section — content sits directly on the canvas. Structure comes from
 *             headings, spacing and thin rules. No border, no shadow.
 *   Panel   — paper-white, hairline border, small radius, no shadow. For
 *             tables, charts and grouped controls.
 *   Floating— elevation, because it genuinely sits above the page. Menus,
 *             dialogs, popovers only.
 *
 * If something looks like it wants a fourth tier, it usually wants to be a
 * Section with better spacing.
 */

// --- Tier 1: sections -------------------------------------------------------

export const Section = ({
  children,
  className,
  as: Tag = "section",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
  labelledBy?: string;
}) => (
  <Tag aria-labelledby={labelledBy} className={cn("space-y-4", className)}>
    {children}
  </Tag>
);

/** Heading for a section sitting on the canvas. */
export const SectionTitle = ({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-subtle pb-3">
    <div className="min-w-0">
      <h2
        id={id}
        className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-primary"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-measure text-label leading-5 text-muted">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

// --- Tier 2: working panels -------------------------------------------------

export const Panel = ({
  children,
  className,
  as: Tag = "section",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
  labelledBy?: string;
}) => (
  <Tag
    aria-labelledby={labelledBy}
    className={cn(
      "rounded-panel border border-subtle bg-surface shadow-panel",
      className,
    )}
  >
    {children}
  </Tag>
);

export const PanelHeader = ({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}) => (
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-subtle px-5 py-3.5">
    <div className="min-w-0">
      <h2
        id={id}
        className="text-label font-semibold tracking-[-0.005em] text-primary"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-0.5 max-w-measure text-label leading-5 text-muted">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const PanelBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("p-5", className)}>{children}</div>;

/**
 * Back-compat alias.
 *
 * Pages not yet migrated keep working and land on the Panel tier, which is the
 * right default for most of them. New code should name the tier explicitly.
 */
export const Card = Panel;
export const CardHeader = PanelHeader;
export const CardBody = PanelBody;

// --- Shared controls --------------------------------------------------------

export const Badge = ({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) => (
  <span
    title={title}
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-2xs font-medium",
      className,
    )}
  >
    {children}
  </span>
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

const BUTTON_VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent-solid text-on-accent hover:bg-accent-solid-hover",
  secondary:
    "border border-strong bg-surface text-primary hover:bg-surface-sunken",
  ghost: "text-secondary hover:bg-surface-sunken hover:text-primary",
  danger: "border border-risk/30 bg-risk-soft text-risk-text hover:bg-risk/15",
};

export const Button = ({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    {...props}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-control font-medium",
      "transition-colors duration-150",
      "disabled:cursor-not-allowed disabled:opacity-50",
      size === "sm" ? "h-8 px-2.5 text-2xs" : "h-9 px-3.5 text-label",
      BUTTON_VARIANTS[variant],
      className,
    )}
  />
);

type SelectProps<T extends string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value"
> & {
  label: string;
  value: T;
  options: readonly T[];
  onValueChange: (value: T) => void;
};

export const Select = <T extends string>({
  label,
  value,
  options,
  onValueChange,
  ...props
}: SelectProps<T>) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-2xs font-medium text-muted">{label}</span>
    <select
      {...props}
      value={value}
      onChange={(event) => onValueChange(event.target.value as T)}
      className={cn(
        "h-9 w-full rounded-control border border-strong bg-surface px-2.5 text-label text-primary",
        "outline-none transition-colors duration-150 focus:border-accent",
      )}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

/** Shown when a filtered view legitimately has nothing in it. */
export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="rounded-panel border border-dashed border-strong bg-surface-sunken px-6 py-12 text-center">
    <p className="text-label font-semibold text-primary">{title}</p>
    <p className="mx-auto mt-1 max-w-measure text-label text-muted">
      {description}
    </p>
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);

/** Monospace identifier, e.g. AI-001. */
export const Mono = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn("font-mono text-2xs tracking-tight text-muted", className)}
  >
    {children}
  </span>
);

/** Editorial briefing callout. Never a generic card with a border; an intentional signal. */
export const Callout = ({
  children,
  className,
  tone = "accent",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  tone?: "accent" | "warn" | "risk" | "ok";
  title?: string;
  action?: ReactNode;
}) => {
  const toneStyles = {
    accent: "border-accent bg-accent-soft text-accent-text",
    warn: "border-warn bg-warn-soft text-warn-text",
    risk: "border-risk bg-risk-soft text-risk-text",
    ok: "border-ok bg-ok-soft text-ok-text",
  }[tone];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-panel border-l-2 px-5 py-4",
        toneStyles,
        className,
      )}
    >
      <div className="min-w-0 max-w-measure flex-1 text-label leading-6">
        {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};

/** Canvas-level filter and control toolbar. Replaces bulky boxed filter forms. */
export const FilterBar = ({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-wrap items-end justify-between gap-4 border-y border-subtle py-3.5",
      className,
    )}
  >
    <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

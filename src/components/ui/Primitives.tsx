import type {
  ButtonHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

/** Small, shared building blocks. Everything here is presentational. */

export const Card = ({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) => (
  <Tag
    className={cn(
      "rounded-xl border border-subtle bg-surface shadow-card",
      "transition-shadow duration-200",
      className,
    )}
  >
    {children}
  </Tag>
);

export const CardHeader = ({
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
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-subtle px-5 py-4">
    <div className="min-w-0">
      <h2 id={id} className="text-sm font-semibold tracking-tight text-primary">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const CardBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn("p-5", className)}>{children}</div>;

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
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-2xs font-semibold",
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
  primary:
    "bg-accent-solid text-on-accent hover:bg-accent-solid-hover shadow-sm",
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
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
      "disabled:cursor-not-allowed disabled:opacity-50",
      size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
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
    <span className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-muted">
      {label}
    </span>
    <select
      {...props}
      value={value}
      onChange={(event) => onValueChange(event.target.value as T)}
      className={cn(
        "w-full rounded-lg border border-strong bg-surface px-3 py-2 text-sm text-primary",
        "transition outline-none focus:border-accent",
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

/** Section heading used outside cards. */
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
  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2
        id={id}
        className="text-base font-semibold tracking-tight text-primary"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
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
  <div className="rounded-xl border border-dashed border-strong bg-surface-sunken px-6 py-12 text-center">
    <p className="text-sm font-semibold text-primary">{title}</p>
    <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
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

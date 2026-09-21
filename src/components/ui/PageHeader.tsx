import type { ReactNode } from "react";

/**
 * Page header.
 *
 * The eyebrow is sentence-scale rather than the old uppercase micro-label:
 * enough to orient, not so much that it reads as chrome. Titles carry the
 * hierarchy, so they are allowed real size.
 */
export const PageHeader = ({
  eyebrow,
  title,
  lede,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
  action?: ReactNode;
}) => (
  <header className="mb-8">
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-measure">
        <p className="font-mono text-2xs font-semibold uppercase tracking-[0.16em] text-accent-text">
          [{eyebrow}]
        </p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-primary sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-6 text-secondary">{lede}</p>
        {children}
      </div>
      {action ? <div className="no-print shrink-0">{action}</div> : null}
    </div>
  </header>
);

export const Page = ({ children }: { children: ReactNode }) => (
  <div className="page-enter space-y-10">{children}</div>
);

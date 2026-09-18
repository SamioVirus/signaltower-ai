import type { ReactNode } from "react";

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
  <header className="mb-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2.5 text-sm leading-6 text-secondary">{lede}</p>
        {children}
      </div>
      {action ? <div className="shrink-0 no-print">{action}</div> : null}
    </div>
  </header>
);

export const Page = ({ children }: { children: ReactNode }) => (
  <div className="page-enter space-y-6">{children}</div>
);

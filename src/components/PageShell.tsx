import type { ReactNode } from "react";

interface PageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  thesis?: string;
  children: ReactNode;
}

export const PageShell = ({ eyebrow, title, description, thesis, children }: PageShellProps) => (
  <div className="page-fade space-y-6">
    <div className="max-w-4xl">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigoTailored-700">{eyebrow}</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {thesis ? <p className="mt-2 text-sm font-semibold text-slate-950">{thesis}</p> : null}
    </div>
    {children}
  </div>
);

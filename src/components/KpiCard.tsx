import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

export const KpiCard = ({ label, value, detail, icon }: KpiCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-executive">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-md bg-indigoTailored-50 text-indigoTailored-700">{icon}</div>
    </div>
    <div className="mt-4 text-xs leading-5 text-slate-500">{detail}</div>
  </div>
);

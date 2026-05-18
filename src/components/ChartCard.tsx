import type { ReactNode } from "react";

import { SectionHeader } from "@/components/SectionHeader";
import { cn } from "@/lib/cn";

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export const ChartCard = ({ title, description, className, children }: ChartCardProps) => (
  <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-executive", className)}>
    <SectionHeader title={title} description={description} />
    <div className="mt-5">{children}</div>
  </section>
);

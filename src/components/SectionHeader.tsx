interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader = ({ title, description }: SectionHeaderProps) => (
  <div>
    <h2 className="text-base font-semibold text-slate-950">{title}</h2>
    {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
  </div>
);

import { CheckCircle2, CircleAlert, Database, FileText, ShieldCheck, UserCheck } from "lucide-react";

import { RiskBadge, StageBadge, StatusPill } from "@/components/Badges";
import { PageShell } from "@/components/PageShell";
import { ReadinessScore } from "@/components/ReadinessScore";
import { SectionHeader } from "@/components/SectionHeader";
import { selectedPassportUseCaseId, useCases } from "@/data/useCases";
import { formatCompactCurrency, formatPercent } from "@/lib/format";

const selectedUseCase = useCases.find((useCase) => useCase.id === selectedPassportUseCaseId) ?? useCases[0];

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
  </div>
);

const EvidenceSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-indigoTailored-50 text-indigoTailored-700">{icon}</div>
      <SectionHeader title={title} />
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

export const EvidencePassportPage = () => {
  const useCase = selectedUseCase;

  return (
    <PageShell
      eyebrow="Evidence Passport"
      title="AI Relationship Manager Briefing Assistant"
      description="A compact control artifact showing what this use case does, who owns it, what value it creates, what evidence exists, and what decision is needed now."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={useCase.stage} />
              <RiskBadge risk={useCase.riskTier} />
              <StatusPill label={useCase.id} />
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{useCase.name}</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{useCase.description}</p>
            <div className="mt-5 rounded-md border border-indigoTailored-100 bg-indigoTailored-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigoTailored-700">Executive decision required</div>
              <div className="mt-2 text-sm font-medium text-slate-950">{useCase.executiveDecisionRequired}</div>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <ReadinessScore score={useCase.readinessScore} />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Annual value" value={formatCompactCurrency(useCase.valueAtStake)} />
              <Field label="DQ score" value={formatPercent(useCase.dataQualityScore)} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <EvidenceSection title="Use Case Summary" icon={<FileText className="h-4 w-4" />}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Business sponsor" value={useCase.sponsor} />
            <Field label="Product owner" value={useCase.productOwner} />
            <Field label="Control owner" value={useCase.controlOwner} />
            <Field label="Intended users" value={useCase.intendedUsers} />
            <Field label="Business function" value={useCase.businessFunction} />
            <Field label="Model type" value={useCase.modelType} />
          </dl>
        </EvidenceSection>

        <EvidenceSection title="Business Value" icon={<CheckCircle2 className="h-4 w-4" />}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Target KPI" value={useCase.kpi} />
            <Field label="KPI baseline" value={useCase.kpiBaseline} />
            <Field label="KPI target" value={useCase.kpiTarget} />
            <Field label="Value at stake" value={formatCompactCurrency(useCase.valueAtStake)} />
          </dl>
        </EvidenceSection>

        <EvidenceSection title="Data And Lineage" icon={<Database className="h-4 w-4" />}>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Field label="Classification" value={useCase.dataClassification} />
            <Field label="Lineage status" value={useCase.lineageStatus} />
            <Field label="Data quality" value={formatPercent(useCase.dataQualityScore)} />
          </dl>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data sources</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {useCase.dataSources.map((source) => <StatusPill key={source} label={source} />)}
            </div>
          </div>
        </EvidenceSection>

        <EvidenceSection title="Risk And Controls" icon={<ShieldCheck className="h-4 w-4" />}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Vendor dependency" value={useCase.vendorDependency} />
            <Field label="Prompt controls" value={useCase.promptInjectionControls} />
            <Field label="Security review" value={useCase.securityReview} />
            <Field label="Privacy review" value={useCase.privacyReview} />
            <Field label="Model risk review" value={useCase.modelRiskReview} />
            <Field label="Compliance review" value={useCase.complianceReview} />
          </dl>
        </EvidenceSection>

        <EvidenceSection title="Human Oversight And Monitoring" icon={<UserCheck className="h-4 w-4" />}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Human review" value={useCase.humanReview} />
            <Field label="Monitoring plan" value={useCase.monitoringPlan} />
          </dl>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ListBlock title="Launch criteria" items={useCase.launchCriteria} />
            <ListBlock title="Post-launch metrics" items={useCase.postLaunchMetrics} />
          </div>
        </EvidenceSection>

        <EvidenceSection title="Missing Evidence" icon={<CircleAlert className="h-4 w-4" />}>
          <ListBlock title="Artifacts to close" items={useCase.missingArtifacts} />
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <span className="font-semibold text-slate-950">Recommended next action:</span> {useCase.nextAction}
          </div>
        </EvidenceSection>
      </div>
    </PageShell>
  );
};

const ListBlock = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
    <ul className="mt-2 space-y-2 text-sm text-slate-700">
      {items.length > 0 ? items.map((item) => <li key={item} className="rounded-md bg-slate-50 px-3 py-2">{item}</li>) : <li className="rounded-md bg-slate-50 px-3 py-2">No missing items</li>}
    </ul>
  </div>
);

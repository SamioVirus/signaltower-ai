import type { AIUseCase, BlockerCategory, ReviewStatus, Stage } from "@/data/useCases";

export const productionReadyStages: Stage[] = ["Production Ready", "Production", "Monitoring"];
export const stages: Stage[] = [
  "Intake",
  "Prioritized",
  "Pilot",
  "Control Review",
  "Production Ready",
  "Production",
  "Monitoring",
];

export const isProductionReady = (useCase: AIUseCase): boolean =>
  productionReadyStages.includes(useCase.stage);

export const isBlocked = (useCase: AIUseCase): boolean =>
  useCase.blockerCategory !== "None" && !["Production", "Monitoring"].includes(useCase.stage);

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

export const getPortfolioMetrics = (useCases: AIUseCase[]) => ({
  totalUseCases: useCases.length,
  totalValueAtStake: useCases.reduce((total, useCase) => total + useCase.valueAtStake, 0),
  blockedCount: useCases.filter(isBlocked).length,
  productionReadyCount: useCases.filter(isProductionReady).length,
  averageReadiness: average(useCases.map((useCase) => useCase.readinessScore)),
  averageStageAging: average(useCases.map((useCase) => useCase.stageAgingDays)),
  evidenceCompleteness: average(useCases.map((useCase) => useCase.readinessScore)),
});

export const groupCount = <T extends string>(
  useCases: AIUseCase[],
  accessor: (useCase: AIUseCase) => T,
): Array<{ name: T; count: number }> => {
  const counts = new Map<T, number>();
  for (const useCase of useCases) {
    const key = accessor(useCase);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
};

export const getStageDistribution = (useCases: AIUseCase[]) =>
  stages.map((stage) => ({
    name: stage,
    count: useCases.filter((useCase) => useCase.stage === stage).length,
  }));

export const getRiskDistribution = (useCases: AIUseCase[]) =>
  groupCount(useCases, (useCase) => useCase.riskTier);

export const getFunctionDistribution = (useCases: AIUseCase[]) =>
  groupCount(useCases, (useCase) => useCase.businessFunction);

export const getTopBlockers = (useCases: AIUseCase[]) =>
  groupCount(
    useCases.filter((useCase) => useCase.blockerCategory !== "None"),
    (useCase) => useCase.blockerCategory,
  ).sort((a, b) => b.count - a.count);

export const getValueTrappedByBlocker = (useCases: AIUseCase[]) => {
  const values = new Map<BlockerCategory, number>();
  for (const useCase of useCases.filter(isBlocked)) {
    values.set(useCase.blockerCategory, (values.get(useCase.blockerCategory) ?? 0) + useCase.valueAtStake);
  }
  return [...values.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export type AgingBucket = "0-14" | "15-30" | "31-60" | "60+";

export const agingBuckets: AgingBucket[] = ["0-14", "15-30", "31-60", "60+"];

export const getAgingBucket = (days: number): AgingBucket => {
  if (days <= 14) return "0-14";
  if (days <= 30) return "15-30";
  if (days <= 60) return "31-60";
  return "60+";
};

export const getStageAgingHeatmap = (useCases: AIUseCase[]) =>
  stages.map((stage) => ({
    stage,
    buckets: agingBuckets.map((bucket) => ({
      bucket,
      count: useCases.filter(
        (useCase) => useCase.stage === stage && getAgingBucket(useCase.stageAgingDays) === bucket,
      ).length,
    })),
  }));

const activeReviewStatuses: ReviewStatus[] = ["Not Started", "In Progress", "Blocked"];

export const getControlQueueLoad = (useCases: AIUseCase[]) => {
  const controls = [
    { name: "Security", accessor: (useCase: AIUseCase) => useCase.securityReview },
    { name: "Privacy", accessor: (useCase: AIUseCase) => useCase.privacyReview },
    { name: "Model Risk", accessor: (useCase: AIUseCase) => useCase.modelRiskReview },
    { name: "Compliance", accessor: (useCase: AIUseCase) => useCase.complianceReview },
  ];

  return controls.map((control) => {
    const queue = useCases.filter((useCase) => activeReviewStatuses.includes(control.accessor(useCase)));
    return {
      name: control.name,
      count: queue.length,
      avgAge: average(queue.map((useCase) => useCase.stageAgingDays)),
    };
  });
};

export interface ExecutiveDecision {
  title: string;
  whyItMatters: string;
  valueAtStake: number;
  riskNote: string;
  owner: string;
  requiredDecision: string;
  expectedImpact: string;
  deadline: string;
}

export const getExecutiveDecisions = (useCases: AIUseCase[]): ExecutiveDecision[] => {
  const relationship = useCases.find((useCase) => useCase.id === "AI-001");
  const credit = useCases.find((useCase) => useCase.id === "AI-002");
  const vendor = useCases.find((useCase) => useCase.id === "AI-004");
  const onboarding = useCases.find((useCase) => useCase.id === "AI-007");
  const agentic = useCases.find((useCase) => useCase.id === "AI-012");

  return [
    {
      title: "Approve data-lineage remediation sprint for Relationship Manager Briefing Assistant.",
      whyItMatters: "A high-value front-office use case is close to production review but lacks two lineage artifacts.",
      valueAtStake: relationship?.valueAtStake ?? 0,
      riskNote: "Cannot proceed to production until lineage is documented for two upstream fields.",
      owner: relationship?.owner ?? "Corporate Banking Transformation",
      requiredDecision: "Assign accountable data owner and approve 14-day remediation sprint.",
      expectedImpact: "Moves the use case from control review toward production readiness.",
      deadline: "This week",
    },
    {
      title: "Create reusable human-in-the-loop control template for moderate-risk internal copilots.",
      whyItMatters: "Several assistant-style workflows need the same reviewer accountability and escalation pattern.",
      valueAtStake: (credit?.valueAtStake ?? 0) + (onboarding?.valueAtStake ?? 0),
      riskNote: "Template must be approved by AI risk, compliance, and business control owners.",
      owner: "AI Governance Working Group",
      requiredDecision: "Sponsor cross-functional working session and approve template ownership.",
      expectedImpact: "Reduces repeated review friction for moderate-risk internal copilots.",
      deadline: "Within 10 business days",
    },
    {
      title: "Pause vendor-facing contract-analysis agent until monitoring controls are defined.",
      whyItMatters: "The pilot has vendor obligations exposure and no approved monitoring plan.",
      valueAtStake: vendor?.valueAtStake ?? 0,
      riskNote: "Agent has access to sensitive contract terms and vendor obligations.",
      owner: vendor?.owner ?? "Procurement Transformation",
      requiredDecision: "Require monitoring and escalation plan before pilot expansion.",
      expectedImpact: "Prevents expansion of a workflow without post-launch control visibility.",
      deadline: "Before next pilot gate",
    },
    {
      title: "Fund document-label remediation for the onboarding checker.",
      whyItMatters: "Data-quality cleanup would unlock a prioritized operations use case with measurable cycle-time value.",
      valueAtStake: onboarding?.valueAtStake ?? 0,
      riskNote: "Weak labels increase false exceptions and create downstream KYC rework.",
      owner: onboarding?.owner ?? "Client Lifecycle Management",
      requiredDecision: "Allocate data stewardship capacity for document-type label remediation.",
      expectedImpact: "Improves readiness and reduces avoidable onboarding rework.",
      deadline: "Next 2 weeks",
    },
    {
      title: "Assign ownership for agentic control design.",
      whyItMatters: "The largest data-governance opportunity is aging in prioritized status without autonomy limits.",
      valueAtStake: agentic?.valueAtStake ?? 0,
      riskNote: "Agentic remediation must define approval gates, rollback, and execution limits before pilot.",
      owner: agentic?.owner ?? "Data Governance Office",
      requiredDecision: "Name the control owner and approve the agentic control design path.",
      expectedImpact: "Turns an open-ended risk debate into a governed remediation path.",
      deadline: "This month",
    },
  ];
};

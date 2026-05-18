export type Stage =
  | "Intake"
  | "Prioritized"
  | "Pilot"
  | "Control Review"
  | "Production Ready"
  | "Production"
  | "Monitoring";

export type RiskTier = "Low" | "Moderate" | "High" | "Restricted";

export type BusinessFunction =
  | "Front Office / Corporate Banking"
  | "Risk / Credit"
  | "Compliance / Financial Crime"
  | "Corporate / Procurement"
  | "Operations"
  | "Legal / Compliance"
  | "Operations / KYC"
  | "Corporate Functions"
  | "Cybersecurity"
  | "Finance"
  | "Markets / Research"
  | "Data Governance";

export type BlockerCategory =
  | "None"
  | "Data Lineage"
  | "Data Quality"
  | "Business KPI"
  | "Security Review"
  | "Model Risk"
  | "Privacy Review"
  | "Human-in-the-Loop"
  | "Vendor Risk"
  | "Monitoring Plan"
  | "Owner Conflict"
  | "Agentic Controls";

export type DataClassification = "Public" | "Internal" | "Confidential" | "Restricted";
export type LineageStatus = "Complete" | "Partial" | "Missing";
export type VendorDependency = "None" | "Low" | "Moderate" | "High";
export type HumanReview = "Not Required" | "Required" | "Designed" | "Incomplete";
export type ReviewStatus = "Not Started" | "In Progress" | "Approved" | "Blocked";
export type MonitoringPlan = "Missing" | "Drafted" | "Approved" | "Live";

export type ReadinessDimension =
  | "Sponsor clarity"
  | "KPI clarity"
  | "Data readiness"
  | "Lineage completeness"
  | "Security review"
  | "Privacy review"
  | "Model risk review"
  | "Human-in-the-loop design"
  | "Monitoring plan"
  | "Value tracking";

export interface AIUseCase {
  id: string;
  name: string;
  description: string;
  businessFunction: BusinessFunction;
  stage: Stage;
  riskTier: RiskTier;
  valueAtStake: number;
  readinessScore: number;
  blockerCategory: BlockerCategory;
  mainBlocker: string;
  owner: string;
  sponsor: string;
  controlOwner: string;
  productOwner: string;
  intendedUsers: string;
  stageAgingDays: number;
  nextAction: string;
  kpi: string;
  kpiBaseline: string;
  kpiTarget: string;
  dataSources: string[];
  dataClassification: DataClassification;
  lineageStatus: LineageStatus;
  dataQualityScore: number;
  modelType: string;
  vendorDependency: VendorDependency;
  humanReview: HumanReview;
  promptInjectionControls: string;
  securityReview: ReviewStatus;
  privacyReview: ReviewStatus;
  modelRiskReview: ReviewStatus;
  complianceReview: ReviewStatus;
  monitoringPlan: MonitoringPlan;
  launchCriteria: string[];
  missingArtifacts: string[];
  executiveDecisionRequired: string;
  postLaunchMetrics: string[];
  readinessDimensions: Record<ReadinessDimension, number>;
}

const dimensions = (
  sponsor: number,
  kpi: number,
  data: number,
  lineage: number,
  security: number,
  privacy: number,
  modelRisk: number,
  human: number,
  monitoring: number,
  value: number,
): Record<ReadinessDimension, number> => ({
  "Sponsor clarity": sponsor,
  "KPI clarity": kpi,
  "Data readiness": data,
  "Lineage completeness": lineage,
  "Security review": security,
  "Privacy review": privacy,
  "Model risk review": modelRisk,
  "Human-in-the-loop design": human,
  "Monitoring plan": monitoring,
  "Value tracking": value,
});

export const useCases: AIUseCase[] = [
  {
    id: "AI-001",
    name: "AI Relationship Manager Briefing Assistant",
    description:
      "Generates pre-meeting briefing packets for relationship managers using approved client, market, and internal relationship data.",
    businessFunction: "Front Office / Corporate Banking",
    stage: "Control Review",
    riskTier: "Moderate",
    valueAtStake: 4_200_000,
    readinessScore: 71,
    blockerCategory: "Data Lineage",
    mainBlocker: "Data lineage incomplete for two upstream relationship-data fields.",
    owner: "Corporate Banking Transformation",
    sponsor: "Head of Corporate Banking Transformation",
    controlOwner: "Data Governance Office",
    productOwner: "Relationship Manager Workflow Lead",
    intendedUsers: "Relationship managers and coverage analysts",
    stageAgingDays: 38,
    nextAction: "Assign data owner for two upstream relationship-data fields",
    kpi: "Analyst preparation time per client meeting",
    kpiBaseline: "3.4 hours per briefing packet",
    kpiTarget: "1.6 hours per briefing packet",
    dataSources: ["Approved client profile data", "Market news summaries", "Internal relationship notes"],
    dataClassification: "Confidential",
    lineageStatus: "Partial",
    dataQualityScore: 78,
    modelType: "Retrieval-augmented generation workflow",
    vendorDependency: "Low",
    humanReview: "Designed",
    promptInjectionControls: "Approved source allowlist, retrieved-context citations, and blocked external URLs",
    securityReview: "Approved",
    privacyReview: "Approved",
    modelRiskReview: "In Progress",
    complianceReview: "In Progress",
    monitoringPlan: "Drafted",
    launchCriteria: [
      "Document lineage owner for all relationship-data fields",
      "Complete model risk review",
      "Validate briefing quality with pilot user group",
    ],
    missingArtifacts: ["Lineage evidence for relationship score", "Lineage evidence for coverage history"],
    executiveDecisionRequired:
      "Assign accountable data owner and approve a 14-day remediation sprint for missing lineage evidence.",
    postLaunchMetrics: ["Briefing preparation time", "Citation acceptance rate", "Escalation volume"],
    readinessDimensions: dimensions(90, 86, 76, 45, 92, 88, 66, 84, 70, 74),
  },
  {
    id: "AI-002",
    name: "Credit Memo Drafting Copilot",
    description: "Drafts credit memo sections from approved borrower, covenant, and facility data.",
    businessFunction: "Risk / Credit",
    stage: "Pilot",
    riskTier: "High",
    valueAtStake: 2_200_000,
    readinessScore: 64,
    blockerCategory: "Human-in-the-Loop",
    mainBlocker: "Human-in-the-loop design incomplete.",
    owner: "Credit Risk Analytics",
    sponsor: "Chief Credit Officer Delegate",
    controlOwner: "Credit Risk Controls",
    productOwner: "Credit Workflow Product Lead",
    intendedUsers: "Credit officers and portfolio analysts",
    stageAgingDays: 52,
    nextAction: "Define reviewer accountability and override logging",
    kpi: "Time to first credit memo draft",
    kpiBaseline: "9.5 hours",
    kpiTarget: "5.5 hours",
    dataSources: ["Borrower financials", "Covenant data", "Facility terms"],
    dataClassification: "Restricted",
    lineageStatus: "Complete",
    dataQualityScore: 74,
    modelType: "Copilot with controlled generation",
    vendorDependency: "Moderate",
    humanReview: "Incomplete",
    promptInjectionControls: "Draft-only mode and controlled source retrieval",
    securityReview: "In Progress",
    privacyReview: "Approved",
    modelRiskReview: "In Progress",
    complianceReview: "In Progress",
    monitoringPlan: "Drafted",
    launchCriteria: ["Approved review workflow", "Override logging", "Quality sampling plan"],
    missingArtifacts: ["Reviewer accountability matrix", "Override log design"],
    executiveDecisionRequired: "Confirm accountable reviewer model before pilot expansion.",
    postLaunchMetrics: ["Draft cycle time", "Reviewer edits", "Policy exception rate"],
    readinessDimensions: dimensions(78, 82, 72, 85, 68, 80, 58, 42, 68, 70),
  },
  {
    id: "AI-003",
    name: "Sanctions Alert Triage Assistant",
    description: "Summarizes sanctions alert context for analyst review without making disposition decisions.",
    businessFunction: "Compliance / Financial Crime",
    stage: "Intake",
    riskTier: "High",
    valueAtStake: 1_100_000,
    readinessScore: 43,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "Compliance Analytics",
    sponsor: "Financial Crime Operations",
    controlOwner: "Compliance Controls",
    productOwner: "Alert Triage Product Lead",
    intendedUsers: "Sanctions operations analysts",
    stageAgingDays: 35,
    nextAction: "Complete AI risk classification and control mapping",
    kpi: "Average analyst review time per alert",
    kpiBaseline: "18 minutes",
    kpiTarget: "13 minutes",
    dataSources: ["Alert metadata", "Watchlist match data", "Case notes"],
    dataClassification: "Restricted",
    lineageStatus: "Partial",
    dataQualityScore: 70,
    modelType: "Summarization assistant",
    vendorDependency: "Low",
    humanReview: "Required",
    promptInjectionControls: "No external browsing, analyst-only summary output",
    securityReview: "Not Started",
    privacyReview: "Not Started",
    modelRiskReview: "Not Started",
    complianceReview: "In Progress",
    monitoringPlan: "Missing",
    launchCriteria: ["Risk classification", "Control mapping", "Sampling plan"],
    missingArtifacts: ["Risk classification", "Control map", "Monitoring plan"],
    executiveDecisionRequired: "Confirm whether this use case enters the governed AI intake backlog.",
    postLaunchMetrics: ["Review time", "Escalation rate", "Disposition rework"],
    readinessDimensions: dimensions(56, 48, 54, 44, 20, 25, 22, 68, 18, 42),
  },
  {
    id: "AI-004",
    name: "Vendor Contract Obligation Extractor",
    description: "Extracts renewal dates, obligations, and service-level clauses from vendor contracts for procurement review.",
    businessFunction: "Corporate / Procurement",
    stage: "Pilot",
    riskTier: "Moderate",
    valueAtStake: 800_000,
    readinessScore: 58,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "Procurement Transformation",
    sponsor: "Head of Strategic Sourcing",
    controlOwner: "Vendor Risk Management",
    productOwner: "Procurement Automation Lead",
    intendedUsers: "Procurement managers and vendor risk analysts",
    stageAgingDays: 44,
    nextAction: "Define post-launch issue and escalation metrics",
    kpi: "Manual obligation extraction hours",
    kpiBaseline: "420 hours per quarter",
    kpiTarget: "240 hours per quarter",
    dataSources: ["Vendor contracts", "Obligation inventories", "Renewal calendars"],
    dataClassification: "Confidential",
    lineageStatus: "Complete",
    dataQualityScore: 76,
    modelType: "Document extraction workflow",
    vendorDependency: "High",
    humanReview: "Required",
    promptInjectionControls: "Contract-only context and extraction confidence threshold",
    securityReview: "Approved",
    privacyReview: "Approved",
    modelRiskReview: "In Progress",
    complianceReview: "Approved",
    monitoringPlan: "Missing",
    launchCriteria: ["Monitoring plan", "Issue taxonomy", "Vendor-risk signoff"],
    missingArtifacts: ["Monitoring plan", "Escalation metrics"],
    executiveDecisionRequired: "Require monitoring and escalation plan before pilot expansion.",
    postLaunchMetrics: ["Extraction precision", "Missed obligation rate", "Escalation cycle time"],
    readinessDimensions: dimensions(75, 65, 72, 84, 80, 80, 58, 62, 18, 54),
  },
  {
    id: "AI-005",
    name: "Treasury Operations Exception Classifier",
    description: "Classifies treasury operations exceptions and routes them to the right queue for resolution.",
    businessFunction: "Operations",
    stage: "Production Ready",
    riskTier: "Low",
    valueAtStake: 1_300_000,
    readinessScore: 88,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "Treasury Operations",
    sponsor: "Head of Treasury Operations",
    controlOwner: "Operations Risk",
    productOwner: "Treasury Automation Lead",
    intendedUsers: "Treasury operations analysts",
    stageAgingDays: 29,
    nextAction: "Approve controlled release to production",
    kpi: "Exception routing accuracy",
    kpiBaseline: "78%",
    kpiTarget: "91%",
    dataSources: ["Exception queue metadata", "Resolution history", "Operational taxonomy"],
    dataClassification: "Internal",
    lineageStatus: "Complete",
    dataQualityScore: 91,
    modelType: "Supervised classifier",
    vendorDependency: "None",
    humanReview: "Required",
    promptInjectionControls: "Not applicable for classifier workflow",
    securityReview: "Approved",
    privacyReview: "Approved",
    modelRiskReview: "Approved",
    complianceReview: "Approved",
    monitoringPlan: "Approved",
    launchCriteria: ["Release approval", "Monitoring dashboard", "Fallback routing"],
    missingArtifacts: [],
    executiveDecisionRequired: "Approve controlled production release.",
    postLaunchMetrics: ["Routing accuracy", "Queue aging", "Manual reclassification"],
    readinessDimensions: dimensions(94, 88, 92, 90, 92, 92, 86, 82, 88, 86),
  },
  {
    id: "AI-006",
    name: "Regulatory Change Impact Summarizer",
    description: "Summarizes regulatory updates and maps likely affected policies, controls, and business owners.",
    businessFunction: "Legal / Compliance",
    stage: "Control Review",
    riskTier: "Moderate",
    valueAtStake: 900_000,
    readinessScore: 76,
    blockerCategory: "Privacy Review",
    mainBlocker: "Privacy review pending.",
    owner: "Legal Operations",
    sponsor: "Deputy General Counsel",
    controlOwner: "Privacy Office",
    productOwner: "Legal Operations Transformation",
    intendedUsers: "Legal, compliance, and policy teams",
    stageAgingDays: 29,
    nextAction: "Complete privacy impact assessment",
    kpi: "Time to initial impact assessment",
    kpiBaseline: "6 business days",
    kpiTarget: "3 business days",
    dataSources: ["Public regulatory updates", "Policy inventory", "Control taxonomy"],
    dataClassification: "Confidential",
    lineageStatus: "Complete",
    dataQualityScore: 84,
    modelType: "Retrieval-augmented summarization",
    vendorDependency: "Low",
    humanReview: "Designed",
    promptInjectionControls: "Public-source isolation and citation requirement",
    securityReview: "Approved",
    privacyReview: "In Progress",
    modelRiskReview: "In Progress",
    complianceReview: "Approved",
    monitoringPlan: "Drafted",
    launchCriteria: ["Privacy impact assessment", "Model risk decision", "User acceptance criteria"],
    missingArtifacts: ["Privacy impact assessment"],
    executiveDecisionRequired: "Prioritize privacy review completion this week.",
    postLaunchMetrics: ["Assessment cycle time", "Citation coverage", "Policy mapping precision"],
    readinessDimensions: dimensions(88, 82, 86, 86, 90, 48, 66, 78, 70, 72),
  },
  {
    id: "AI-007",
    name: "Client Onboarding Document Checker",
    description: "Checks client onboarding packets for missing documents and document-type inconsistencies.",
    businessFunction: "Operations / KYC",
    stage: "Prioritized",
    riskTier: "Moderate",
    valueAtStake: 1_500_000,
    readinessScore: 67,
    blockerCategory: "Data Quality",
    mainBlocker: "Data quality below threshold.",
    owner: "Client Lifecycle Management",
    sponsor: "Head of Client Lifecycle",
    controlOwner: "KYC Controls",
    productOwner: "Onboarding Workflow Lead",
    intendedUsers: "Client onboarding specialists",
    stageAgingDays: 33,
    nextAction: "Remediate missing document-type labels",
    kpi: "Onboarding packet rework rate",
    kpiBaseline: "22%",
    kpiTarget: "14%",
    dataSources: ["Document metadata", "KYC checklist", "Onboarding workflow history"],
    dataClassification: "Confidential",
    lineageStatus: "Complete",
    dataQualityScore: 62,
    modelType: "Document classification and rules workflow",
    vendorDependency: "None",
    humanReview: "Required",
    promptInjectionControls: "No free-form generation",
    securityReview: "In Progress",
    privacyReview: "Approved",
    modelRiskReview: "In Progress",
    complianceReview: "In Progress",
    monitoringPlan: "Drafted",
    launchCriteria: ["Document label remediation", "KYC control signoff", "Exception monitoring"],
    missingArtifacts: ["Data-quality remediation evidence"],
    executiveDecisionRequired: "Approve remediation capacity for document-label cleanup.",
    postLaunchMetrics: ["Rework rate", "Document exception rate", "Cycle time reduction"],
    readinessDimensions: dimensions(82, 78, 42, 82, 66, 82, 60, 72, 66, 70),
  },
  {
    id: "AI-008",
    name: "Internal Policy Q&A Assistant",
    description: "Answers employee questions using approved internal policy content and escalation links.",
    businessFunction: "Corporate Functions",
    stage: "Production",
    riskTier: "Low",
    valueAtStake: 600_000,
    readinessScore: 93,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "HR / Policy Operations",
    sponsor: "Head of HR Operations",
    controlOwner: "Corporate Policy Office",
    productOwner: "Employee Experience Product Lead",
    intendedUsers: "Employees and HR service teams",
    stageAgingDays: 20,
    nextAction: "Monitor answer quality and escalation trends",
    kpi: "Policy inquiry self-service rate",
    kpiBaseline: "38%",
    kpiTarget: "58%",
    dataSources: ["Approved policy repository", "FAQ content", "Escalation directory"],
    dataClassification: "Internal",
    lineageStatus: "Complete",
    dataQualityScore: 94,
    modelType: "Retrieval-augmented Q&A assistant",
    vendorDependency: "Low",
    humanReview: "Required",
    promptInjectionControls: "Approved content retrieval and escalation-first fallback",
    securityReview: "Approved",
    privacyReview: "Approved",
    modelRiskReview: "Approved",
    complianceReview: "Approved",
    monitoringPlan: "Live",
    launchCriteria: ["Live monitoring", "Escalation owner", "Policy refresh cadence"],
    missingArtifacts: [],
    executiveDecisionRequired: "No executive action required; monitor operating health.",
    postLaunchMetrics: ["Self-service rate", "Answer quality score", "Escalation rate"],
    readinessDimensions: dimensions(96, 92, 94, 94, 96, 96, 88, 90, 94, 90),
  },
  {
    id: "AI-009",
    name: "Cyber Incident Narrative Generator",
    description: "Drafts incident narratives from approved incident timelines and response notes for cyber operations review.",
    businessFunction: "Cybersecurity",
    stage: "Pilot",
    riskTier: "Moderate",
    valueAtStake: 700_000,
    readinessScore: 62,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "Cyber Operations",
    sponsor: "Security Operations Lead",
    controlOwner: "Cybersecurity Architecture",
    productOwner: "Incident Response Automation Lead",
    intendedUsers: "Incident response managers",
    stageAgingDays: 46,
    nextAction: "Review prompt injection and data-exposure controls",
    kpi: "Incident narrative drafting time",
    kpiBaseline: "2.5 hours",
    kpiTarget: "1.3 hours",
    dataSources: ["Incident timeline", "Response notes", "Approved severity taxonomy"],
    dataClassification: "Restricted",
    lineageStatus: "Complete",
    dataQualityScore: 80,
    modelType: "Controlled generation workflow",
    vendorDependency: "Low",
    humanReview: "Required",
    promptInjectionControls: "No external content, incident-only context, redaction guardrails",
    securityReview: "In Progress",
    privacyReview: "Approved",
    modelRiskReview: "In Progress",
    complianceReview: "Approved",
    monitoringPlan: "Drafted",
    launchCriteria: ["Architecture review", "Redaction validation", "Monitoring dashboard"],
    missingArtifacts: ["Security architecture review"],
    executiveDecisionRequired: "Schedule architecture review before the next pilot gate.",
    postLaunchMetrics: ["Drafting time", "Redaction exceptions", "Reviewer edits"],
    readinessDimensions: dimensions(82, 70, 78, 86, 44, 82, 62, 74, 60, 62),
  },
  {
    id: "AI-010",
    name: "Finance Forecast Variance Explainer",
    description: "Explains drivers of forecast variance using finance-approved commentary and planning data.",
    businessFunction: "Finance",
    stage: "Monitoring",
    riskTier: "Low",
    valueAtStake: 800_000,
    readinessScore: 91,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "FP&A Transformation",
    sponsor: "Finance Transformation Lead",
    controlOwner: "Finance Controls",
    productOwner: "Planning Analytics Product Lead",
    intendedUsers: "FP&A analysts and finance managers",
    stageAgingDays: 24,
    nextAction: "Compare realized time savings against baseline",
    kpi: "Variance commentary cycle time",
    kpiBaseline: "4 business days",
    kpiTarget: "2.5 business days",
    dataSources: ["Forecast data", "Planning commentary", "Variance taxonomy"],
    dataClassification: "Confidential",
    lineageStatus: "Complete",
    dataQualityScore: 90,
    modelType: "Narrative analytics assistant",
    vendorDependency: "None",
    humanReview: "Required",
    promptInjectionControls: "Approved planning data only",
    securityReview: "Approved",
    privacyReview: "Approved",
    modelRiskReview: "Approved",
    complianceReview: "Approved",
    monitoringPlan: "Live",
    launchCriteria: ["Value tracking", "Production health metrics", "Fallback procedure"],
    missingArtifacts: [],
    executiveDecisionRequired: "No executive action required; track realized value.",
    postLaunchMetrics: ["Cycle time", "Commentary rework", "Analyst adoption"],
    readinessDimensions: dimensions(94, 92, 90, 92, 94, 94, 88, 88, 92, 86),
  },
  {
    id: "AI-011",
    name: "Market News Impact Screener",
    description: "Screens market news for potentially relevant client and portfolio impacts for research review.",
    businessFunction: "Markets / Research",
    stage: "Intake",
    riskTier: "Moderate",
    valueAtStake: 1_200_000,
    readinessScore: 49,
    blockerCategory: "None",
    mainBlocker: "None",
    owner: "Markets Strategy",
    sponsor: "Markets Transformation",
    controlOwner: "Research Controls",
    productOwner: "Research Workflow Lead",
    intendedUsers: "Research analysts and markets strategy teams",
    stageAgingDays: 49,
    nextAction: "Define KPI baseline and target user group",
    kpi: "Relevant news screening time",
    kpiBaseline: "Not baselined",
    kpiTarget: "Define during intake",
    dataSources: ["Public news feeds", "Approved research taxonomy", "Client sector mappings"],
    dataClassification: "Internal",
    lineageStatus: "Partial",
    dataQualityScore: 72,
    modelType: "Classification and summarization workflow",
    vendorDependency: "Moderate",
    humanReview: "Required",
    promptInjectionControls: "Public-source isolation and analyst review",
    securityReview: "Not Started",
    privacyReview: "Approved",
    modelRiskReview: "Not Started",
    complianceReview: "In Progress",
    monitoringPlan: "Missing",
    launchCriteria: ["KPI baseline", "Target user group", "Review path"],
    missingArtifacts: ["KPI baseline", "Target user group"],
    executiveDecisionRequired: "Require KPI baseline before prioritization.",
    postLaunchMetrics: ["Screening time", "Analyst relevance rating", "False positive rate"],
    readinessDimensions: dimensions(58, 22, 68, 52, 30, 78, 25, 62, 20, 34),
  },
  {
    id: "AI-012",
    name: "Agentic Data Quality Remediation Assistant",
    description: "Proposes and prepares data-quality remediations with explicit approval gates and rollback controls.",
    businessFunction: "Data Governance",
    stage: "Prioritized",
    riskTier: "High",
    valueAtStake: 3_100_000,
    readinessScore: 55,
    blockerCategory: "Agentic Controls",
    mainBlocker: "Agentic control design incomplete.",
    owner: "Data Governance Office",
    sponsor: "Chief Data Office",
    controlOwner: "Enterprise Data Controls",
    productOwner: "Data Quality Platform Lead",
    intendedUsers: "Data stewards and data-quality operations teams",
    stageAgingDays: 105,
    nextAction: "Define autonomy limits, approval gates, and rollback plan",
    kpi: "Manual data-quality remediation hours",
    kpiBaseline: "1,200 hours per quarter",
    kpiTarget: "780 hours per quarter",
    dataSources: ["Data quality issue logs", "Reference data", "Stewardship workflow history"],
    dataClassification: "Confidential",
    lineageStatus: "Complete",
    dataQualityScore: 69,
    modelType: "Agentic remediation assistant with approval gates",
    vendorDependency: "Moderate",
    humanReview: "Incomplete",
    promptInjectionControls: "Tool allowlist, approval gates, execution sandbox, rollback requirements",
    securityReview: "In Progress",
    privacyReview: "In Progress",
    modelRiskReview: "Blocked",
    complianceReview: "In Progress",
    monitoringPlan: "Missing",
    launchCriteria: ["Autonomy limits", "Rollback plan", "Agentic control approval"],
    missingArtifacts: ["Autonomy limits", "Approval gate design", "Rollback plan"],
    executiveDecisionRequired: "Define ownership for agentic control template and escalation path.",
    postLaunchMetrics: ["Remediation accuracy", "Rollback frequency", "Approval cycle time"],
    readinessDimensions: dimensions(78, 72, 64, 82, 52, 56, 28, 26, 18, 72),
  },
];

export const selectedPassportUseCaseId = "AI-001";

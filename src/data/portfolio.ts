import type {
  ControlId,
  EvidenceArtifact,
  Initiative,
  Portfolio,
} from "@/engine/types";

/**
 * Synthetic portfolio fixture.
 *
 * SYNTHETIC DATA ONLY. No real institution, system, person or metric appears
 * here. The scenarios are composites of publicly discussed enterprise AI
 * adoption patterns in regulated industries.
 *
 * Note what this file does *not* contain: no readiness scores, no blocker
 * labels, no decision list, no stage-gate verdicts. Those are conclusions, and
 * conclusions are derived in `src/engine` from the evidence recorded below.
 * If you want to change what the dashboard says, change the evidence or the
 * policy and let the engine re-derive it.
 */

const ev = (
  state: EvidenceArtifact["state"],
  owner: string,
  ageDays: number,
  note: string,
): EvidenceArtifact => ({ state, owner, ageDays, note });

const na = (note: string): EvidenceArtifact => ({
  state: "not_applicable",
  owner: "Not applicable",
  ageDays: 0,
  note,
});

type Evidence = Record<ControlId, EvidenceArtifact>;

export const portfolio: Portfolio = [
  {
    id: "AI-001",
    name: "Relationship Manager Briefing Assistant",
    description:
      "Generates pre-meeting briefing packets for relationship managers from approved client, market and internal relationship data.",
    businessFunction: "Front Office / Corporate Banking",
    stage: "Control Review",
    riskTier: "Moderate",
    annualValueUsd: 4_200_000,
    stageAgeDays: 38,
    sponsor: "Head of Corporate Banking Transformation",
    productOwner: "Relationship Manager Workflow Lead",
    controlOwner: "Data Governance Office",
    deliveryTeam: "Corporate Banking Transformation",
    intendedUsers: "Relationship managers and coverage analysts",
    kpi: {
      metric: "Analyst preparation time per client meeting",
      baseline: "3.4 hours per briefing packet",
      target: "1.6 hours per briefing packet",
      isBaselined: true,
    },
    data: {
      sources: [
        "Approved client profile data",
        "Market news summaries",
        "Internal relationship notes",
      ],
      classification: "Confidential",
      qualityScore: 78,
    },
    model: {
      type: "Retrieval-augmented generation workflow",
      vendorDependency: "Low",
      isAgentic: false,
      injectionControls:
        "Approved source allowlist, retrieved-context citations, external URLs blocked",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Corporate Banking Transformation",
        96,
        "Sponsor confirmed at the quarterly portfolio review.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        74,
        "Baseline measured across 240 briefing packets.",
      ),
      "data-quality": ev(
        "partial",
        "Data Governance Office",
        41,
        "Profiling complete; two relationship fields below the agreed threshold.",
      ),
      lineage: ev(
        "missing",
        "Data Governance Office",
        38,
        "Relationship score and coverage history have no documented data owner.",
      ),
      "security-review": ev(
        "approved",
        "Cybersecurity Architecture",
        61,
        "Reviewed; retrieval allowlist and URL blocking accepted as mitigations.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        58,
        "Assessed; client data use limited to existing coverage relationships.",
      ),
      "model-risk": ev(
        "in_progress",
        "Model Risk Management",
        33,
        "Validation sampling under way; citation fidelity testing outstanding.",
      ),
      "human-oversight": ev(
        "partial",
        "Relationship Manager Workflow Lead",
        45,
        "Reviewer role defined; override logging not yet specified.",
      ),
      monitoring: ev(
        "partial",
        "AI Operations",
        29,
        "Signals drafted; thresholds and fallback owner still open.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        52,
        "Instrumentation designed against the baseline, not yet built.",
      ),
      "vendor-risk": ev(
        "approved",
        "Vendor Risk Management",
        88,
        "Embedding provider assessed; exit position documented.",
      ),
      "agentic-controls": na(
        "Drafts briefing packets only; takes no action in any system.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Briefing preparation time",
      "Citation acceptance rate",
      "Escalation volume",
    ],
  },
  {
    id: "AI-002",
    name: "Credit Memo Drafting Copilot",
    description:
      "Drafts credit memo sections from approved borrower, covenant and facility data for credit officer review.",
    businessFunction: "Risk / Credit",
    stage: "Pilot",
    riskTier: "High",
    annualValueUsd: 2_200_000,
    stageAgeDays: 52,
    sponsor: "Chief Credit Officer Delegate",
    productOwner: "Credit Workflow Product Lead",
    controlOwner: "Credit Risk Controls",
    deliveryTeam: "Credit Risk Analytics",
    intendedUsers: "Credit officers and portfolio analysts",
    kpi: {
      metric: "Time to first credit memo draft",
      baseline: "9.5 hours",
      target: "5.5 hours",
      isBaselined: true,
    },
    data: {
      sources: ["Borrower financials", "Covenant data", "Facility terms"],
      classification: "Restricted",
      qualityScore: 74,
    },
    model: {
      type: "Copilot with controlled generation",
      vendorDependency: "Moderate",
      isAgentic: false,
      injectionControls:
        "Draft-only mode, controlled source retrieval, no external content",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Credit Risk Analytics",
        110,
        "Chief Credit Officer delegate named as accountable sponsor.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        84,
        "Baseline drawn from 18 months of memo cycle times.",
      ),
      "data-quality": ev(
        "partial",
        "Credit Risk Analytics",
        47,
        "Covenant data profiled; facility terms sampling incomplete.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        66,
        "All three sources mapped to owned golden-source tables.",
      ),
      "security-review": ev(
        "in_progress",
        "Cybersecurity Architecture",
        52,
        "Review open; restricted-data handling in the draft store under discussion.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        71,
        "No personal data beyond existing credit file scope.",
      ),
      "model-risk": ev(
        "in_progress",
        "Model Risk Management",
        44,
        "Validation plan agreed; generation quality sampling not started.",
      ),
      "human-oversight": ev(
        "missing",
        "Credit Risk Controls",
        52,
        "No reviewer accountability matrix and no override logging design.",
      ),
      monitoring: ev(
        "partial",
        "AI Operations",
        38,
        "Draft cycle-time signals defined; quality sampling plan outstanding.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        60,
        "Tracking approach agreed, pending pilot instrumentation.",
      ),
      "vendor-risk": ev(
        "partial",
        "Vendor Risk Management",
        57,
        "Assessment started; concentration position not yet documented.",
      ),
      "agentic-controls": na(
        "Produces draft text for review; commits nothing to a system of record.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Draft cycle time",
      "Reviewer edit rate",
      "Policy exception rate",
    ],
  },
  {
    id: "AI-003",
    name: "Sanctions Alert Triage Assistant",
    description:
      "Summarises sanctions alert context for analyst review. Makes no disposition decision and proposes no outcome.",
    businessFunction: "Compliance / Financial Crime",
    stage: "Intake",
    riskTier: "High",
    annualValueUsd: 1_100_000,
    stageAgeDays: 35,
    sponsor: "Financial Crime Operations",
    productOwner: "Alert Triage Product Lead",
    controlOwner: "Compliance Controls",
    deliveryTeam: "Compliance Analytics",
    intendedUsers: "Sanctions operations analysts",
    kpi: {
      metric: "Average analyst review time per alert",
      baseline: "18 minutes",
      target: "13 minutes",
      isBaselined: true,
    },
    data: {
      sources: ["Alert metadata", "Watchlist match data", "Case notes"],
      classification: "Restricted",
      qualityScore: 70,
    },
    model: {
      type: "Summarisation assistant",
      vendorDependency: "Low",
      isAgentic: false,
      injectionControls: "No external browsing; analyst-only summary output",
    },
    evidence: {
      sponsor: ev(
        "partial",
        "Compliance Analytics",
        35,
        "Operations sponsor engaged; accountability not yet confirmed in writing.",
      ),
      "kpi-baseline": ev(
        "in_progress",
        "Business Analytics",
        35,
        "Review-time sampling under way across two alert queues.",
      ),
      "data-quality": ev(
        "in_progress",
        "Compliance Analytics",
        30,
        "Case-note completeness being profiled.",
      ),
      lineage: ev(
        "partial",
        "Data Governance Office",
        35,
        "Alert metadata mapped; case-note provenance incomplete.",
      ),
      "security-review": ev(
        "missing",
        "Cybersecurity Architecture",
        35,
        "Not scheduled. Restricted data in scope.",
      ),
      "privacy-review": ev("missing", "Privacy Office", 35, "Not scheduled."),
      "model-risk": ev(
        "missing",
        "Model Risk Management",
        35,
        "Risk classification not yet performed.",
      ),
      "human-oversight": ev(
        "partial",
        "Compliance Controls",
        28,
        "Analyst-decides model assumed; escalation path not documented.",
      ),
      monitoring: ev("missing", "AI Operations", 35, "No monitoring plan."),
      "value-tracking": ev(
        "in_progress",
        "Business Analytics",
        35,
        "Approach sketched against the review-time baseline.",
      ),
      "vendor-risk": ev(
        "partial",
        "Vendor Risk Management",
        30,
        "Hosted inference dependency identified; assessment not complete.",
      ),
      "agentic-controls": na(
        "Summarises for the analyst; performs no disposition and no action.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Review time",
      "Escalation rate",
      "Disposition rework rate",
    ],
  },
  {
    id: "AI-004",
    name: "Vendor Contract Obligation Extractor",
    description:
      "Extracts renewal dates, obligations and service-level clauses from vendor contracts for procurement review.",
    businessFunction: "Corporate / Procurement",
    stage: "Pilot",
    riskTier: "Moderate",
    annualValueUsd: 800_000,
    stageAgeDays: 44,
    sponsor: "Head of Strategic Sourcing",
    productOwner: "Procurement Automation Lead",
    controlOwner: "Vendor Risk Management",
    deliveryTeam: "Procurement Transformation",
    intendedUsers: "Procurement managers and vendor risk analysts",
    kpi: {
      metric: "Manual obligation extraction hours",
      baseline: "420 hours per quarter",
      target: "240 hours per quarter",
      isBaselined: true,
    },
    data: {
      sources: [
        "Vendor contracts",
        "Obligation inventories",
        "Renewal calendars",
      ],
      classification: "Confidential",
      qualityScore: 76,
    },
    model: {
      type: "Document extraction workflow",
      vendorDependency: "High",
      isAgentic: false,
      injectionControls:
        "Contract-only context; extraction confidence threshold with human fallback",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Procurement Transformation",
        92,
        "Head of Strategic Sourcing accountable for the obligation backlog.",
      ),
      "kpi-baseline": ev(
        "partial",
        "Business Analytics",
        55,
        "Quarterly hours estimated from timesheets; not yet validated.",
      ),
      "data-quality": ev(
        "partial",
        "Procurement Transformation",
        44,
        "Contract corpus profiled; older scanned agreements below threshold.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        70,
        "Contract repository is the documented golden source.",
      ),
      "security-review": ev(
        "approved",
        "Cybersecurity Architecture",
        63,
        "Reviewed; document store isolation accepted.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        63,
        "Limited personal data; supplier contact fields minimised.",
      ),
      "model-risk": ev(
        "in_progress",
        "Model Risk Management",
        36,
        "Extraction precision validation under way.",
      ),
      "human-oversight": ev(
        "partial",
        "Procurement Automation Lead",
        40,
        "Below-threshold extractions route to a human; reviewer logging undefined.",
      ),
      monitoring: ev(
        "missing",
        "AI Operations",
        44,
        "No monitoring plan, no issue taxonomy and no escalation metrics.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        50,
        "Hours-saved measure agreed; instrumentation not built.",
      ),
      "vendor-risk": ev(
        "in_progress",
        "Vendor Risk Management",
        44,
        "High third-party dependency; concentration and exit assessment open.",
      ),
      "agentic-controls": na(
        "Extracts and proposes; never amends a contract or a system record.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Extraction precision",
      "Missed obligation rate",
      "Escalation cycle time",
    ],
  },
  {
    id: "AI-005",
    name: "Treasury Operations Exception Classifier",
    description:
      "Classifies treasury operations exceptions and routes them to the resolution queue best matched to the exception type.",
    businessFunction: "Operations",
    stage: "Production Ready",
    riskTier: "Low",
    annualValueUsd: 1_300_000,
    stageAgeDays: 29,
    sponsor: "Head of Treasury Operations",
    productOwner: "Treasury Automation Lead",
    controlOwner: "Operations Risk",
    deliveryTeam: "Treasury Operations",
    intendedUsers: "Treasury operations analysts",
    kpi: {
      metric: "Exception routing accuracy",
      baseline: "78%",
      target: "91%",
      isBaselined: true,
    },
    data: {
      sources: [
        "Exception queue metadata",
        "Resolution history",
        "Operational taxonomy",
      ],
      classification: "Internal",
      qualityScore: 91,
    },
    model: {
      type: "Supervised classifier",
      vendorDependency: "None",
      isAgentic: false,
      injectionControls:
        "Not applicable: no free-text generation and no external input",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Treasury Operations",
        120,
        "Head of Treasury Operations owns the routing accuracy target.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        96,
        "Routing accuracy measured over 12 months of resolved exceptions.",
      ),
      "data-quality": ev(
        "approved",
        "Operations Risk",
        44,
        "Queue metadata and taxonomy validated at 91% quality.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        80,
        "All three sources mapped to owned operational tables.",
      ),
      "security-review": ev(
        "approved",
        "Cybersecurity Architecture",
        72,
        "Internal-only data; review closed with no findings.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        72,
        "No personal data in scope.",
      ),
      "model-risk": ev(
        "approved",
        "Model Risk Management",
        40,
        "Validated; performance and drift thresholds agreed.",
      ),
      "human-oversight": ev(
        "approved",
        "Operations Risk",
        38,
        "Analyst confirms routing; misroutes are logged and fed back.",
      ),
      monitoring: ev(
        "approved",
        "AI Operations",
        31,
        "Accuracy, queue-aging and reclassification dashboards signed off.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        29,
        "Accuracy tracking live; hours-saved measure lands with the release.",
      ),
      "vendor-risk": na(
        "No third-party dependency: trained and served in-house.",
      ),
      "agentic-controls": na(
        "Classifies and routes within a fixed queue taxonomy; no autonomous action.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Routing accuracy",
      "Queue aging",
      "Manual reclassification rate",
    ],
  },
  {
    id: "AI-006",
    name: "Regulatory Change Impact Summariser",
    description:
      "Summarises regulatory updates and maps the policies, controls and business owners likely to be affected.",
    businessFunction: "Legal / Compliance",
    stage: "Control Review",
    riskTier: "Moderate",
    annualValueUsd: 900_000,
    stageAgeDays: 29,
    sponsor: "Deputy General Counsel",
    productOwner: "Legal Operations Transformation",
    controlOwner: "Privacy Office",
    deliveryTeam: "Legal Operations",
    intendedUsers: "Legal, compliance and policy teams",
    kpi: {
      metric: "Time to initial impact assessment",
      baseline: "6 business days",
      target: "3 business days",
      isBaselined: true,
    },
    data: {
      sources: [
        "Public regulatory updates",
        "Policy inventory",
        "Control taxonomy",
      ],
      classification: "Confidential",
      qualityScore: 84,
    },
    model: {
      type: "Retrieval-augmented summarisation",
      vendorDependency: "Low",
      isAgentic: false,
      injectionControls:
        "Public-source isolation, citation required for every mapped policy",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Legal Operations",
        88,
        "Deputy General Counsel accountable for assessment turnaround.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        70,
        "Assessment cycle time measured over two regulatory quarters.",
      ),
      "data-quality": ev(
        "approved",
        "Legal Operations",
        44,
        "Policy inventory and control taxonomy validated at 84%.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        62,
        "Policy inventory mapped; public sources are externally attributable.",
      ),
      "security-review": ev(
        "approved",
        "Cybersecurity Architecture",
        55,
        "Public-source isolation accepted; no internal write paths.",
      ),
      "privacy-review": ev(
        "in_progress",
        "Privacy Office",
        29,
        "Privacy impact assessment open; personal data in policy owner records.",
      ),
      "model-risk": ev(
        "in_progress",
        "Model Risk Management",
        29,
        "Mapping precision validation under way.",
      ),
      "human-oversight": ev(
        "partial",
        "Legal Operations Transformation",
        34,
        "Lawyer confirms every mapping; override logging not specified.",
      ),
      monitoring: ev(
        "partial",
        "AI Operations",
        26,
        "Citation coverage signal drafted; thresholds outstanding.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        40,
        "Cycle-time measure agreed; instrumentation pending.",
      ),
      "vendor-risk": ev(
        "approved",
        "Vendor Risk Management",
        80,
        "Inference provider assessed under the existing enterprise agreement.",
      ),
      "agentic-controls": na(
        "Summarises and maps; updates no policy and files no change record.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Assessment cycle time",
      "Citation coverage",
      "Policy mapping precision",
    ],
  },
  {
    id: "AI-007",
    name: "Client Onboarding Document Checker",
    description:
      "Checks client onboarding packets for missing documents and document-type inconsistencies before KYC review.",
    businessFunction: "Operations / KYC",
    stage: "Prioritized",
    riskTier: "Moderate",
    annualValueUsd: 1_500_000,
    stageAgeDays: 33,
    sponsor: "Head of Client Lifecycle",
    productOwner: "Onboarding Workflow Lead",
    controlOwner: "KYC Controls",
    deliveryTeam: "Client Lifecycle Management",
    intendedUsers: "Client onboarding specialists",
    kpi: {
      metric: "Onboarding packet rework rate",
      baseline: "22%",
      target: "14%",
      isBaselined: true,
    },
    data: {
      sources: [
        "Document metadata",
        "KYC checklist",
        "Onboarding workflow history",
      ],
      classification: "Confidential",
      qualityScore: 62,
    },
    model: {
      type: "Document classification and rules workflow",
      vendorDependency: "None",
      isAgentic: false,
      injectionControls: "No free-form generation; fixed checklist output",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Client Lifecycle Management",
        78,
        "Head of Client Lifecycle owns the rework-rate target.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        60,
        "Rework rate measured across 6,000 onboarding packets.",
      ),
      "data-quality": ev(
        "missing",
        "Data Governance Office",
        33,
        "Document-type labels are 62% complete, well below the 85% threshold.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        64,
        "Document metadata and workflow history mapped to owned sources.",
      ),
      "security-review": ev(
        "in_progress",
        "Cybersecurity Architecture",
        33,
        "Review open; document store access paths under assessment.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        58,
        "Assessed; identity document handling limited to existing KYC scope.",
      ),
      "model-risk": ev(
        "in_progress",
        "Model Risk Management",
        30,
        "Classification precision validation under way.",
      ),
      "human-oversight": ev(
        "partial",
        "KYC Controls",
        36,
        "Specialist confirms every exception; override logging undefined.",
      ),
      monitoring: ev(
        "partial",
        "AI Operations",
        28,
        "Exception monitoring drafted; thresholds not agreed.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        44,
        "Rework tracking designed against the baseline.",
      ),
      "vendor-risk": na(
        "No third-party dependency: rules and classifier run in-house.",
      ),
      "agentic-controls": na(
        "Flags missing documents; requests nothing and files nothing.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Rework rate",
      "Document exception rate",
      "Onboarding cycle time",
    ],
  },
  {
    id: "AI-008",
    name: "Internal Policy Q&A Assistant",
    description:
      "Answers employee policy questions from approved internal policy content, with escalation links when confidence is low.",
    businessFunction: "Corporate Functions",
    stage: "Production",
    riskTier: "Low",
    annualValueUsd: 600_000,
    stageAgeDays: 20,
    sponsor: "Head of HR Operations",
    productOwner: "Employee Experience Product Lead",
    controlOwner: "Corporate Policy Office",
    deliveryTeam: "HR / Policy Operations",
    intendedUsers: "Employees and HR service teams",
    kpi: {
      metric: "Policy inquiry self-service rate",
      baseline: "38%",
      target: "58%",
      isBaselined: true,
    },
    data: {
      sources: [
        "Approved policy repository",
        "FAQ content",
        "Escalation directory",
      ],
      classification: "Internal",
      qualityScore: 94,
    },
    model: {
      type: "Retrieval-augmented Q&A assistant",
      vendorDependency: "Low",
      isAgentic: false,
      injectionControls:
        "Approved content retrieval only; escalation-first fallback below confidence threshold",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "HR / Policy Operations",
        140,
        "Head of HR Operations owns the self-service target.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        130,
        "Self-service rate measured across 18 months of HR tickets.",
      ),
      "data-quality": ev(
        "approved",
        "Corporate Policy Office",
        60,
        "Policy repository validated at 94%; refresh cadence agreed.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        96,
        "Policy repository is the documented source of record.",
      ),
      "security-review": ev(
        "approved",
        "Cybersecurity Architecture",
        104,
        "Internal content only; review closed.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        104,
        "No personal data beyond the requesting employee identity.",
      ),
      "model-risk": ev(
        "approved",
        "Model Risk Management",
        76,
        "Validated; answer quality and refusal thresholds agreed.",
      ),
      "human-oversight": ev(
        "approved",
        "Corporate Policy Office",
        70,
        "HR service team owns escalations; answer quality sampled weekly.",
      ),
      monitoring: ev(
        "approved",
        "AI Operations",
        20,
        "Live: self-service rate, answer quality and escalation dashboards.",
      ),
      "value-tracking": ev(
        "approved",
        "Business Analytics",
        20,
        "Self-service rate tracked against the 38% baseline.",
      ),
      "vendor-risk": ev(
        "approved",
        "Vendor Risk Management",
        110,
        "Inference provider assessed; exit path documented.",
      ),
      "agentic-controls": na(
        "Answers questions and links to escalation; takes no action.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Self-service rate",
      "Answer quality score",
      "Escalation rate",
    ],
  },
  {
    id: "AI-009",
    name: "Cyber Incident Narrative Generator",
    description:
      "Drafts incident narratives from approved incident timelines and response notes for cyber operations review.",
    businessFunction: "Cybersecurity",
    stage: "Pilot",
    riskTier: "Moderate",
    annualValueUsd: 700_000,
    stageAgeDays: 46,
    sponsor: "Security Operations Lead",
    productOwner: "Incident Response Automation Lead",
    controlOwner: "Cybersecurity Architecture",
    deliveryTeam: "Cyber Operations",
    intendedUsers: "Incident response managers",
    kpi: {
      metric: "Incident narrative drafting time",
      baseline: "2.5 hours",
      target: "1.3 hours",
      isBaselined: true,
    },
    data: {
      sources: [
        "Incident timeline",
        "Response notes",
        "Approved severity taxonomy",
      ],
      classification: "Restricted",
      qualityScore: 80,
    },
    model: {
      type: "Controlled generation workflow",
      vendorDependency: "Low",
      isAgentic: false,
      injectionControls:
        "Incident-only context, no external content, redaction guardrails on response notes",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Cyber Operations",
        86,
        "Security Operations Lead accountable for drafting turnaround.",
      ),
      "kpi-baseline": ev(
        "partial",
        "Business Analytics",
        58,
        "Drafting time sampled on 40 incidents; severity mix not yet balanced.",
      ),
      "data-quality": ev(
        "partial",
        "Cyber Operations",
        46,
        "Timeline data validated; response-note completeness varies by team.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        68,
        "Incident platform is the documented source for all three inputs.",
      ),
      "security-review": ev(
        "missing",
        "Cybersecurity Architecture",
        46,
        "Architecture review not scheduled. Restricted incident data in scope.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        66,
        "Assessed; responder identities redacted before generation.",
      ),
      "model-risk": ev(
        "in_progress",
        "Model Risk Management",
        41,
        "Narrative fidelity validation under way.",
      ),
      "human-oversight": ev(
        "partial",
        "Incident Response Automation Lead",
        43,
        "Incident manager approves every narrative; edit capture undefined.",
      ),
      monitoring: ev(
        "partial",
        "AI Operations",
        35,
        "Redaction-exception signal drafted; dashboard not built.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        50,
        "Drafting-time measure agreed against the sampled baseline.",
      ),
      "vendor-risk": ev(
        "approved",
        "Vendor Risk Management",
        84,
        "Provider assessed under the restricted-data addendum.",
      ),
      "agentic-controls": na(
        "Drafts narratives for review; updates no incident record.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Drafting time",
      "Redaction exceptions",
      "Reviewer edit rate",
    ],
  },
  {
    id: "AI-010",
    name: "Finance Forecast Variance Explainer",
    description:
      "Explains drivers of forecast variance using finance-approved commentary and planning data.",
    businessFunction: "Finance",
    stage: "Monitoring",
    riskTier: "Low",
    annualValueUsd: 800_000,
    stageAgeDays: 24,
    sponsor: "Finance Transformation Lead",
    productOwner: "Planning Analytics Product Lead",
    controlOwner: "Finance Controls",
    deliveryTeam: "FP&A Transformation",
    intendedUsers: "FP&A analysts and finance managers",
    kpi: {
      metric: "Variance commentary cycle time",
      baseline: "4 business days",
      target: "2.5 business days",
      isBaselined: true,
    },
    data: {
      sources: ["Forecast data", "Planning commentary", "Variance taxonomy"],
      classification: "Confidential",
      qualityScore: 90,
    },
    model: {
      type: "Narrative analytics assistant",
      vendorDependency: "None",
      isAgentic: false,
      injectionControls:
        "Approved planning data only; no external or free-text input",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "FP&A Transformation",
        150,
        "Finance Transformation Lead owns the cycle-time target.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        140,
        "Cycle time measured across eight planning cycles.",
      ),
      "data-quality": ev(
        "approved",
        "Finance Controls",
        70,
        "Forecast and commentary data validated at 90%.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        100,
        "Planning system is the documented golden source.",
      ),
      "security-review": ev(
        "approved",
        "Cybersecurity Architecture",
        112,
        "Internal planning data; review closed.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        112,
        "No personal data in scope.",
      ),
      "model-risk": ev(
        "approved",
        "Model Risk Management",
        84,
        "Validated; commentary fidelity thresholds agreed.",
      ),
      "human-oversight": ev(
        "approved",
        "Finance Controls",
        76,
        "Analyst approves commentary before distribution; edits captured.",
      ),
      monitoring: ev(
        "approved",
        "AI Operations",
        24,
        "Live: cycle time, rework and adoption dashboards.",
      ),
      "value-tracking": ev(
        "approved",
        "Business Analytics",
        24,
        "Realised cycle-time saving tracked against the 4-day baseline.",
      ),
      "vendor-risk": na(
        "No third-party dependency: served on internal infrastructure.",
      ),
      "agentic-controls": na(
        "Explains variance; changes no forecast and posts no entry.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Cycle time",
      "Commentary rework rate",
      "Analyst adoption",
    ],
  },
  {
    id: "AI-011",
    name: "Market News Impact Screener",
    description:
      "Screens market news for potentially relevant client and portfolio impacts, for research analyst review.",
    businessFunction: "Markets / Research",
    stage: "Intake",
    riskTier: "Moderate",
    annualValueUsd: 1_200_000,
    stageAgeDays: 49,
    sponsor: "Markets Transformation",
    productOwner: "Research Workflow Lead",
    controlOwner: "Research Controls",
    deliveryTeam: "Markets Strategy",
    intendedUsers: "Research analysts and markets strategy teams",
    kpi: {
      metric: "Relevant news screening time",
      baseline: "Not baselined",
      target: "To be defined during intake",
      isBaselined: false,
    },
    data: {
      sources: [
        "Public news feeds",
        "Approved research taxonomy",
        "Client sector mappings",
      ],
      classification: "Internal",
      qualityScore: 72,
    },
    model: {
      type: "Classification and summarisation workflow",
      vendorDependency: "Moderate",
      isAgentic: false,
      injectionControls:
        "Public-source isolation; analyst review before any distribution",
    },
    evidence: {
      sponsor: ev(
        "partial",
        "Markets Strategy",
        49,
        "Markets Transformation interested; no accountable executive named.",
      ),
      "kpi-baseline": ev(
        "missing",
        "Business Analytics",
        49,
        "No measured baseline and no agreed target user group.",
      ),
      "data-quality": ev(
        "partial",
        "Markets Strategy",
        42,
        "Sector mappings profiled; news feed coverage gaps unresolved.",
      ),
      lineage: ev(
        "partial",
        "Data Governance Office",
        49,
        "Taxonomy mapped; client sector mapping ownership unclear.",
      ),
      "security-review": ev(
        "missing",
        "Cybersecurity Architecture",
        49,
        "Not scheduled.",
      ),
      "privacy-review": ev(
        "approved",
        "Privacy Office",
        66,
        "Public news and internal mappings only; no personal data.",
      ),
      "model-risk": ev(
        "missing",
        "Model Risk Management",
        49,
        "Risk classification not performed.",
      ),
      "human-oversight": ev(
        "partial",
        "Research Controls",
        44,
        "Analyst review assumed; relevance thresholds undefined.",
      ),
      monitoring: ev("missing", "AI Operations", 49, "No monitoring plan."),
      "value-tracking": ev(
        "missing",
        "Business Analytics",
        49,
        "Cannot be defined until a KPI baseline exists.",
      ),
      "vendor-risk": ev(
        "partial",
        "Vendor Risk Management",
        45,
        "News aggregation dependency identified; assessment not complete.",
      ),
      "agentic-controls": na(
        "Screens and summarises for analysts; distributes nothing on its own.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Screening time",
      "Analyst relevance rating",
      "False positive rate",
    ],
  },
  {
    id: "AI-012",
    name: "Agentic Data Quality Remediation Assistant",
    description:
      "Proposes and prepares data-quality remediations, then executes approved fixes within explicit autonomy limits.",
    businessFunction: "Data Governance",
    stage: "Prioritized",
    riskTier: "High",
    annualValueUsd: 3_100_000,
    stageAgeDays: 105,
    sponsor: "Chief Data Office",
    productOwner: "Data Quality Platform Lead",
    controlOwner: "Enterprise Data Controls",
    deliveryTeam: "Data Governance Office",
    intendedUsers: "Data stewards and data-quality operations teams",
    kpi: {
      metric: "Manual data-quality remediation hours",
      baseline: "1,200 hours per quarter",
      target: "780 hours per quarter",
      isBaselined: true,
    },
    data: {
      sources: [
        "Data quality issue logs",
        "Reference data",
        "Stewardship workflow history",
      ],
      classification: "Confidential",
      qualityScore: 69,
    },
    model: {
      type: "Agentic remediation assistant with approval gates",
      vendorDependency: "Moderate",
      isAgentic: true,
      injectionControls:
        "Tool allowlist, approval gate before every write, execution sandbox, rollback required",
    },
    evidence: {
      sponsor: ev(
        "approved",
        "Data Governance Office",
        130,
        "Chief Data Office accountable for the remediation backlog.",
      ),
      "kpi-baseline": ev(
        "approved",
        "Business Analytics",
        118,
        "Remediation hours measured across four quarters of steward effort.",
      ),
      "data-quality": ev(
        "partial",
        "Data Governance Office",
        60,
        "Issue logs profiled; reference data completeness at 69%.",
      ),
      lineage: ev(
        "approved",
        "Data Governance Office",
        90,
        "Issue logs and reference data mapped to owned sources.",
      ),
      "security-review": ev(
        "in_progress",
        "Cybersecurity Architecture",
        74,
        "Open: write access and sandbox boundary under assessment.",
      ),
      "privacy-review": ev(
        "in_progress",
        "Privacy Office",
        74,
        "Open: personal data present in some remediated reference records.",
      ),
      "model-risk": ev(
        "missing",
        "Model Risk Management",
        105,
        "Blocked pending an agreed control design for autonomous action.",
      ),
      "human-oversight": ev(
        "missing",
        "Enterprise Data Controls",
        105,
        "No approval-gate design and no steward accountability model.",
      ),
      monitoring: ev(
        "missing",
        "AI Operations",
        105,
        "No monitoring plan and no rollback-frequency signal.",
      ),
      "value-tracking": ev(
        "partial",
        "Business Analytics",
        80,
        "Hours-saved measure agreed against the steward-effort baseline.",
      ),
      "vendor-risk": ev(
        "in_progress",
        "Vendor Risk Management",
        70,
        "Orchestration dependency assessment open.",
      ),
      "agentic-controls": ev(
        "missing",
        "Enterprise Data Controls",
        105,
        "No autonomy limits, no blast-radius definition and no tested rollback path.",
      ),
    } satisfies Evidence,
    postLaunchMetrics: [
      "Remediation accuracy",
      "Rollback frequency",
      "Approval cycle time",
    ],
  },
] satisfies Initiative[];

/** The initiative shown first when no id is supplied. */
export const FEATURED_INITIATIVE_ID = "AI-001";

export const initiativeIds: string[] = portfolio.map(
  (initiative) => initiative.id,
);

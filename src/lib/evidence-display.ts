import type { EvidenceState, RiskTier, Stage } from "@/engine/types";
import type { ReadinessBand } from "@/engine/readiness";

/**
 * Presentation mapping for domain values.
 *
 * Kept out of the components so that a state's colour and wording are decided
 * once. Colour is never the only signal: every mapping also carries a label,
 * so the interface stays readable without colour vision.
 */

export interface Tone {
  label: string;
  /** Tailwind classes for a soft chip. */
  chip: string;
  /** Tailwind class for a solid dot or bar. */
  solid: string;
  description: string;
}

export const EVIDENCE_TONES: Record<EvidenceState, Tone> = {
  approved: {
    label: "Approved",
    chip: "bg-ok-soft text-ok-text ring-1 ring-ok/25",
    solid: "bg-ok",
    description:
      "Signed off. The artifact exists and the control owner accepted it.",
  },
  partial: {
    label: "Partial",
    chip: "bg-warn-soft text-warn-text ring-1 ring-warn/25",
    solid: "bg-warn",
    description: "The artifact exists but is incomplete.",
  },
  in_progress: {
    label: "In progress",
    chip: "bg-info-soft text-info-text ring-1 ring-info/25",
    solid: "bg-info",
    description: "Work has started. No artifact yet.",
  },
  missing: {
    label: "Missing",
    chip: "bg-risk-soft text-risk-text ring-1 ring-risk/25",
    solid: "bg-risk",
    description: "Nothing exists. This is what a gate will stop on.",
  },
  not_applicable: {
    label: "N/A",
    chip: "bg-neutral-soft text-muted ring-1 ring-subtle",
    solid: "bg-subtle",
    description: "The control does not apply, and is excluded from the score.",
  },
};

export const BAND_TONES: Record<ReadinessBand, Tone> = {
  "Production ready": {
    label: "Production ready",
    chip: "bg-ok-soft text-ok-text ring-1 ring-ok/25",
    solid: "bg-ok",
    description: "Every control this initiative needs has been approved.",
  },
  "Production candidate": {
    label: "Production candidate",
    chip: "bg-ok-soft text-ok-text ring-1 ring-ok/25",
    solid: "bg-ok",
    description: "Close. A small number of controls remain.",
  },
  Reviewable: {
    label: "Reviewable",
    chip: "bg-info-soft text-info-text ring-1 ring-info/25",
    solid: "bg-info",
    description: "Enough evidence to review, not enough to ship.",
  },
  "Needs remediation": {
    label: "Needs remediation",
    chip: "bg-warn-soft text-warn-text ring-1 ring-warn/25",
    solid: "bg-warn",
    description: "Material control gaps across several dimensions.",
  },
  "Not ready": {
    label: "Not ready",
    chip: "bg-risk-soft text-risk-text ring-1 ring-risk/25",
    solid: "bg-risk",
    description: "Early. Most control evidence does not exist yet.",
  },
};

export const RISK_TONES: Record<RiskTier, string> = {
  Low: "bg-neutral-soft text-neutral-text ring-1 ring-subtle",
  Moderate: "bg-info-soft text-info-text ring-1 ring-info/25",
  High: "bg-warn-soft text-warn-text ring-1 ring-warn/25",
  Restricted: "bg-risk-soft text-risk-text ring-1 ring-risk/25",
};

export const STAGE_TONES: Record<Stage, string> = {
  Intake: "bg-neutral-soft text-neutral-text ring-1 ring-subtle",
  Prioritized: "bg-neutral-soft text-neutral-text ring-1 ring-subtle",
  Pilot: "bg-info-soft text-info-text ring-1 ring-info/25",
  "Control Review": "bg-accent-soft text-accent-text ring-1 ring-accent-border",
  "Production Ready": "bg-ok-soft text-ok-text ring-1 ring-ok/25",
  Production: "bg-ok-soft text-ok-text ring-1 ring-ok/25",
  Monitoring: "bg-ok-soft text-ok-text ring-1 ring-ok/25",
};

/** Short stage labels for dense axes. */
export const STAGE_SHORT: Record<Stage, string> = {
  Intake: "Intake",
  Prioritized: "Priorit.",
  Pilot: "Pilot",
  "Control Review": "Control",
  "Production Ready": "Prod ready",
  Production: "Production",
  Monitoring: "Monitoring",
};

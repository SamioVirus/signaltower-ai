import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Primitives";
import type { ReadinessBand } from "@/engine/readiness";
import type { EvidenceState, RiskTier, Stage } from "@/engine/types";
import { cn } from "@/lib/cn";
import {
  BAND_TONES,
  EVIDENCE_TONES,
  RISK_TONES,
  STAGE_TONES,
} from "@/lib/evidence-display";
import { formatPercent } from "@/lib/format";

/** Domain indicators. Colour always travels with a text label. */

export const StageBadge = ({ stage }: { stage: Stage }) => (
  <Badge className={STAGE_TONES[stage]}>{stage}</Badge>
);

export const RiskBadge = ({ risk }: { risk: RiskTier }) => (
  <Badge className={RISK_TONES[risk]} title={`${risk} risk tier`}>
    {risk} risk
  </Badge>
);

export const BandBadge = ({ band }: { band: ReadinessBand }) => (
  <Badge className={BAND_TONES[band].chip}>{band}</Badge>
);

export const EvidenceBadge = ({
  state,
  className,
}: {
  state: EvidenceState;
  className?: string;
}) => {
  const tone = EVIDENCE_TONES[state];
  return (
    <Badge className={cn(tone.chip, className)} title={tone.description}>
      <span
        className={cn("h-1.5 w-1.5 rounded-full", tone.solid)}
        aria-hidden="true"
      />
      {tone.label}
    </Badge>
  );
};

/**
 * Readiness meter.
 *
 * The bar is decorative; the number and band carry the meaning, so the value is
 * announced to assistive technology rather than implied by bar width.
 */
export const ReadinessMeter = ({
  score,
  band,
  size = "md",
  showBand = true,
}: {
  score: number;
  band: ReadinessBand;
  size?: "sm" | "md" | "lg";
  showBand?: boolean;
}) => {
  const tone = BAND_TONES[band];
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span
          data-metric
          className={cn(
            "font-semibold tracking-[-0.02em] text-primary",
            size === "lg"
              ? "text-[2rem] leading-none"
              : size === "md"
                ? "text-lg"
                : "text-label",
          )}
        >
          {formatPercent(score)}
        </span>
        {showBand ? <span className="text-2xs text-muted">{band}</span> : null}
      </div>
      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Readiness ${score} percent, ${band}`}
        className={cn(
          "overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-subtle",
          size === "lg" ? "h-2" : "h-1.5",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            tone.solid,
          )}
          style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Metric strip.
 *
 * Six numbers on a shared baseline, divided by hairlines, sitting directly on
 * the canvas. The previous version gave each one its own bordered card, which
 * made a count of initiatives look as consequential as a leadership decision.
 */
export const StatStrip = ({ children }: { children: ReactNode }) => (
  <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-subtle py-6 sm:grid-cols-3 xl:grid-cols-6 xl:gap-x-8">
    {children}
  </dl>
);

export const Stat = ({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  /** Tints the number only where the number itself is the warning. */
  tone?: "default" | "warn" | "risk" | "ok";
}) => (
  <div className="min-w-0 xl:border-l xl:border-subtle xl:pl-5 xl:first:border-l-0 xl:first:pl-0">
    <dt className="text-2xs font-medium text-muted">{label}</dt>
    <dd>
      <span
        data-metric
        className={cn(
          "mt-1.5 block text-[1.75rem] font-semibold leading-none tracking-[-0.02em]",
          tone === "risk"
            ? "text-risk-text"
            : tone === "warn"
              ? "text-warn-text"
              : tone === "ok"
                ? "text-ok-text"
                : "text-primary",
        )}
      >
        {value}
      </span>
      {detail ? (
        <span className="mt-2 block text-2xs leading-5 text-muted">
          {detail}
        </span>
      ) : null}
    </dd>
  </div>
);

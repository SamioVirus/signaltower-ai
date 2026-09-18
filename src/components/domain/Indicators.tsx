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

/** Domain-specific indicators. Colour always travels with a text label. */

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
 * The bar is decorative; the number and band carry the meaning, so the value
 * is announced to assistive technology rather than implied by bar width.
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
            "font-semibold tracking-tight text-primary",
            size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-sm",
          )}
        >
          {formatPercent(score)}
        </span>
        {showBand ? (
          <span className="text-2xs font-medium text-muted">{band}</span>
        ) : null}
      </div>
      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Readiness ${score} percent, ${band}`}
        className={cn(
          "overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-subtle",
          size === "lg" ? "h-2.5" : "h-1.5",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            tone.solid,
          )}
          style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
        />
      </div>
    </div>
  );
};

/** A single headline number with supporting context. */
export const Stat = ({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: React.ReactNode;
  tone?: "default" | "warn" | "risk" | "ok";
}) => {
  const accent =
    tone === "risk"
      ? "bg-risk-soft text-risk-text"
      : tone === "warn"
        ? "bg-warn-soft text-warn-text"
        : tone === "ok"
          ? "bg-ok-soft text-ok-text"
          : "bg-accent-soft text-accent-text";

  return (
    <div className="rounded-xl border border-subtle bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
              accent,
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        data-metric
        className="mt-2 text-2xl font-semibold tracking-tight text-primary"
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
      ) : null}
    </div>
  );
};

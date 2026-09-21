import { cn } from "@/lib/cn";

/**
 * The SignalTower mark.
 *
 * Three signal lines. Two run clear; the middle one stops short and resumes at
 * a single emphasised point. That gap is the whole product in one glyph — a
 * sequence interrupted at the checkpoint that has not cleared — and it is the
 * same geometry the gate diagram uses.
 *
 * Drawn in `currentColor` so it survives being a favicon, a one-colour print
 * mark, or a nav glyph, with the accent applied only where a second colour is
 * genuinely available.
 */
export const SignalMark = ({
  className,
  accent = true,
  title,
}: {
  className?: string;
  /** Render the checkpoint in the accent colour rather than currentColor. */
  accent?: boolean;
  title?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("h-6 w-6", className)}
    fill="none"
    role={title ? "img" : "presentation"}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    {title ? <title>{title}</title> : null}
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="19" y2="6" />
      {/* The interrupted line: stops short of where it should reach. */}
      <line x1="3" y1="12" x2="12" y2="12" opacity="0.55" />
      <line x1="3" y1="18" x2="19" y2="18" />
    </g>
    {/* The checkpoint that needs attention. */}
    <circle
      cx="18.5"
      cy="12"
      r="2.6"
      className={accent ? "fill-accent" : "fill-current"}
    />
  </svg>
);

/**
 * Mark plus wordmark. `AI` is a descriptor, set quietly — it does not need to
 * compete with the product name.
 */
export const Wordmark = ({
  className,
  tone = "default",
  showDescriptor = true,
}: {
  className?: string;
  /** `inverted` for the graphite navigation rail. */
  tone?: "default" | "inverted";
  showDescriptor?: boolean;
}) => (
  <span className={cn("flex items-center gap-2.5", className)}>
    <SignalMark
      className={cn(
        "h-6 w-6 shrink-0",
        tone === "inverted" ? "text-white/85" : "text-primary",
      )}
    />
    <span className="min-w-0 leading-tight">
      <span
        className={cn(
          "block truncate text-[0.9375rem] font-semibold tracking-[-0.01em]",
          tone === "inverted" ? "text-white" : "text-primary",
        )}
      >
        SignalTower
      </span>
      {showDescriptor ? (
        <span
          className={cn(
            "block truncate text-2xs",
            tone === "inverted" ? "text-white/65" : "text-muted",
          )}
        >
          Enterprise AI control tower
        </span>
      ) : null}
    </span>
  </span>
);

import { evaluateGate } from "@/engine/gates";
import { stageIndex } from "@/engine/policy";
import type { Initiative } from "@/engine/types";
import { STAGES } from "@/engine/types";
import { cn } from "@/lib/cn";

/**
 * Gate ladder.
 *
 * The signature diagram, and the same geometry as the brand mark: a run of
 * checkpoints where the line breaks at the one that has not cleared.
 *
 * Three states, and they are deliberately distinguishable without colour —
 * a filled node, a ringed node and a hollow node read differently in
 * greyscale, at 200% zoom, and to anyone who cannot separate teal from amber.
 * Every node also carries text.
 */

/**
 * Whether the gate is met. Being the *current* stage is a separate dimension —
 * an initiative can sit in a stage whose gate it never cleared, which is
 * exactly the control debt this diagram needs to show rather than hide.
 */
type NodeState = "cleared" | "pending" | "blocked";

const nodeLabel: Record<NodeState, string> = {
  cleared: "Gate cleared",
  pending: "Not yet reached",
  blocked: "Gate not met",
};

export const GateLadder = ({ initiative }: { initiative: Initiative }) => {
  const currentIndex = stageIndex(initiative.stage);

  const rows = STAGES.map((stage, index) => {
    const verdict = evaluateGate(initiative, stage);
    const reached = index <= currentIndex;

    // A stage already entered but whose gate never passed is control debt —
    // the interruption the diagram exists to make visible.
    const state: NodeState = verdict.passed
      ? reached
        ? "cleared"
        : "pending"
      : reached
        ? "blocked"
        : "pending";

    return { stage, verdict, index, state, isCurrent: index === currentIndex };
  });

  // The rail runs solid until the first unmet gate, then goes quiet.
  const firstUnmet = rows.findIndex((row) => !row.verdict.passed);

  return (
    <ol className="relative">
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1;
        const railQuiet = firstUnmet !== -1 && i >= firstUnmet;

        return (
          <li key={row.stage} className="relative flex gap-3.5 pb-4 last:pb-0">
            {/* Rail */}
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[7px] top-4 h-full w-px",
                  railQuiet
                    ? "bg-[repeating-linear-gradient(to_bottom,rgb(var(--border-strong))_0_3px,transparent_3px_6px)]"
                    : "bg-accent/45",
                )}
              />
            ) : null}

            {/* Checkpoint */}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-[3px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border-2",
                row.state === "cleared" && "border-accent bg-accent",
                row.state === "blocked" && "border-warn bg-surface",
                row.state === "pending" && "border-strong bg-surface",
                // The stage you are standing in gets a ring, whatever its gate says.
                row.isCurrent &&
                  "ring-2 ring-accent/30 ring-offset-2 ring-offset-surface",
              )}
            >
              {row.isCurrent && row.state !== "cleared" ? (
                <span className="h-[5px] w-[5px] rounded-full bg-accent" />
              ) : null}
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span
                  className={cn(
                    "text-label font-semibold",
                    row.isCurrent ? "text-primary" : "text-secondary",
                  )}
                >
                  {row.stage}
                </span>
                {row.isCurrent ? (
                  <span className="text-2xs font-medium text-accent-text">
                    Current
                  </span>
                ) : null}
                <span className="sr-only">{nodeLabel[row.state]}</span>
              </p>

              <p className="mt-0.5 text-2xs leading-5 text-muted">
                {row.verdict.required.length === 0 ? (
                  "No controls required at this gate"
                ) : row.verdict.passed ? (
                  `All ${row.verdict.required.length} required controls approved`
                ) : (
                  <>
                    <span className="font-medium text-warn-text">
                      {row.verdict.blocking.length} of{" "}
                      {row.verdict.required.length} outstanding
                    </span>
                    {/*
                      Gate requirements are cumulative, so every gate beyond the
                      first unmet one repeats the same list. Naming them once —
                      at the gate actually being attempted — is the difference
                      between a diagram and a wall of duplicated text.
                    */}
                    {i <= Math.max(firstUnmet, 0) ? (
                      <>
                        {": "}
                        {row.verdict.blocking
                          .map((control) => control.shortLabel.toLowerCase())
                          .join(", ")}
                      </>
                    ) : null}
                  </>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

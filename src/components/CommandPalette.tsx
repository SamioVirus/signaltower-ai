import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, Search } from "lucide-react";

import { NAV_ITEMS } from "@/components/navigation";
import { portfolio } from "@/data/portfolio";
import { scoreInitiative } from "@/engine/readiness";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

interface Command {
  id: string;
  label: string;
  hint: string;
  group: "Pages" | "Initiatives";
  to: string;
}

/** Built once: the catalogue does not change while the app is running. */
const COMMANDS: Command[] = [
  ...NAV_ITEMS.map((item) => ({
    id: `page:${item.to}`,
    label: item.label,
    hint: item.description,
    group: "Pages" as const,
    to: item.to,
  })),
  ...portfolio.map((initiative) => ({
    id: `initiative:${initiative.id}`,
    label: initiative.name,
    hint: `${initiative.id} · ${initiative.stage} · ${formatPercent(
      scoreInitiative(initiative).score,
    )} ready`,
    group: "Initiatives" as const,
    to: `/initiatives/${initiative.id}`,
  })),
];

/**
 * Command palette.
 *
 * Twelve initiatives across nine screens is more than a sidebar can make
 * reachable in one hop. This is the keyboard path: Cmd/Ctrl-K, type, Enter.
 *
 * The component is mounted only while open, so opening it is what resets it.
 * That removes the effect that would otherwise set state during render and
 * cause a second pass on every open.
 */
export const CommandPalette = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return COMMANDS;
    return COMMANDS.filter((command) =>
      `${command.label} ${command.hint}`.toLowerCase().includes(needle),
    );
  }, [query]);

  // Derived during render rather than corrected in an effect: as the result
  // list shrinks the highlight simply clamps, with no extra render pass.
  const active = Math.min(highlighted, Math.max(results.length - 1, 0));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape closes from anywhere inside the dialog, including the backdrop.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const go = (command: Command | undefined) => {
    if (!command) return;
    navigate(command.to);
    onClose();
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((active + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((active - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      {/* A real button, so dismissing by clicking away is reachable by
          keyboard and announced, rather than a div with an onClick. */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages and initiatives"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-strong bg-surface shadow-raised"
      >
        <div className="flex items-center gap-3 border-b border-subtle px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlighted(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search pages and initiatives…"
            aria-label="Search pages and initiatives"
            aria-controls={listId}
            aria-activedescendant={
              results[active] ? `${listId}-${results[active].id}` : undefined
            }
            className="w-full bg-transparent py-3.5 text-sm text-primary outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-subtle bg-surface-sunken px-1.5 py-0.5 font-mono text-2xs text-muted sm:block">
            Esc
          </kbd>
        </div>

        <ul id={listId} className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted">
              Nothing matches “{query}”.
            </li>
          ) : (
            results.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;

              return (
                <li key={command.id}>
                  {showGroup ? (
                    <p className="px-4 pb-1 pt-3 text-2xs font-semibold uppercase tracking-wider text-muted">
                      {command.group}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    id={`${listId}-${command.id}`}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => go(command)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition",
                      index === active
                        ? "bg-accent-soft"
                        : "hover:bg-surface-sunken",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-primary">
                        {command.label}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {command.hint}
                      </span>
                    </span>
                    {index === active ? (
                      <CornerDownLeft
                        className="h-3.5 w-3.5 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";

import { Wordmark } from "@/components/Brand";
import { CommandPalette } from "@/components/CommandPalette";
import { NAV_ITEMS } from "@/components/navigation";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

/**
 * Application shell.
 *
 * A graphite rail anchors the page and gives the warm canvas something to sit
 * against. Navigation is the one place the interface is allowed to be dark in
 * light mode — it is furniture, not content.
 */

const ThemeToggle = ({
  tone = "default",
}: {
  tone?: "default" | "inverted";
}) => {
  const { preference, cycle } = useTheme();
  const Icon =
    preference === "light" ? Sun : preference === "dark" ? Moon : Monitor;
  const next =
    preference === "light"
      ? "dark"
      : preference === "dark"
        ? "system"
        : "light";

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${preference}. Switch to ${next}.`}
      aria-label={`Theme: ${preference}. Switch to ${next}.`}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-control transition-colors duration-150",
        tone === "inverted"
          ? "text-white/70 hover:bg-white/10 hover:text-white"
          : "border border-subtle bg-surface text-secondary hover:bg-surface-sunken hover:text-primary",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};

const NavList = ({
  onNavigate,
  tone = "inverted",
}: {
  onNavigate?: () => void;
  tone?: "default" | "inverted";
}) => (
  <ul className="space-y-0.5">
    {NAV_ITEMS.map((item) => (
      <li key={item.to}>
        <NavLink
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "relative flex items-center gap-2.5 rounded-control py-2 pl-3.5 pr-3 text-label font-medium",
              "transition-colors duration-150",
              tone === "inverted"
                ? isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/65 hover:bg-white/[0.05] hover:text-white/90"
                : isActive
                  ? "bg-accent-soft text-accent-text"
                  : "text-secondary hover:bg-surface-sunken hover:text-primary",
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* The signal marker: a short accent stroke on the selected item. */}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-accent"
                />
              ) : null}
              <item.icon
                className="h-4 w-4 shrink-0 opacity-80"
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      </li>
    ))}
  </ul>
);

const SyntheticNotice = ({
  tone = "inverted",
}: {
  tone?: "default" | "inverted";
}) => (
  <p
    className={cn(
      "text-2xs leading-5",
      tone === "inverted" ? "text-white/60" : "text-muted",
    )}
  >
    <span className={tone === "inverted" ? "text-white/65" : "text-secondary"}>
      Synthetic data.
    </span>{" "}
    No real institution, system or person. No backend or tracking.
  </p>
);

export const AppShell = () => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Cmd/Ctrl-K opens the palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-graphite px-3 py-5 lg:flex">
        <NavLink
          to="/"
          className="rounded-control px-2 py-1 transition-colors duration-150 hover:bg-white/[0.05]"
        >
          <Wordmark tone="inverted" />
        </NavLink>

        <nav aria-label="Primary" className="mt-7 flex-1">
          <NavList />
        </nav>

        <div className="space-y-4 px-1">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-control border border-white/10 px-2.5 py-1.5 text-2xs text-white/60 transition-colors duration-150 hover:border-white/20 hover:text-white/75"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="font-mono">⌘K</kbd>
          </button>
          <SyntheticNotice />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-graphite px-4 py-2.5 lg:hidden">
        <NavLink to="/">
          <Wordmark tone="inverted" showDescriptor={false} />
        </NavLink>
        <div className="flex items-center gap-1">
          <ThemeToggle tone="inverted" />
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="grid h-8 w-8 place-items-center rounded-control text-white/65 transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            {mobileNavOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {mobileNavOpen ? (
        <nav
          aria-label="Primary"
          className="sticky top-[49px] z-20 bg-graphite px-3 pb-4 lg:hidden"
        >
          <NavList onNavigate={() => setMobileNavOpen(false)} />
          <div className="mt-4 px-1">
            <SyntheticNotice />
          </div>
        </nav>
      ) : null}

      <div className="lg:pl-60">
        <div className="sticky top-0 z-20 hidden justify-end border-b border-subtle bg-canvas/85 px-8 py-2 backdrop-blur lg:flex">
          <ThemeToggle />
        </div>

        <main
          id="main"
          className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
        >
          {/*
            Routes are code-split, so the content area suspends on navigation
            while the shell around it stays mounted.
          */}
          <Suspense
            fallback={
              <p
                role="status"
                aria-live="polite"
                className="py-8 text-label text-muted"
              >
                Loading…
              </p>
            }
          >
            <Outlet />
          </Suspense>
        </main>

        <footer className="mx-auto max-w-content px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="signal-rule" aria-hidden="true" />
          <p className="mt-4 max-w-measure text-2xs leading-5 text-muted">
            A synthetic portfolio demonstration. Every figure is derived from
            the evidence fixture by the engine in{" "}
            <code className="font-mono">src/engine</code>, under the policy
            documented on the{" "}
            <NavLink
              to="/methodology"
              className="font-medium text-accent hover:underline"
            >
              Methodology
            </NavLink>{" "}
            page.
          </p>
        </footer>
      </div>

      {paletteOpen ? (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      ) : null}
    </div>
  );
};

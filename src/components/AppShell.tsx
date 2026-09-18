import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Command, Menu, Monitor, Moon, Sun, X } from "lucide-react";

import { CommandPalette } from "@/components/CommandPalette";
import { NAV_ITEMS } from "@/components/navigation";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

const Wordmark = () => (
  <span className="flex items-center gap-2.5">
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-solid text-xs font-bold text-on-accent"
      aria-hidden="true"
    >
      ST
    </span>
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold tracking-tight text-primary">
        SignalTower
      </span>
      <span className="block truncate text-2xs text-muted">
        Enterprise AI control tower
      </span>
    </span>
  </span>
);

const ThemeToggle = () => {
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
      className="grid h-9 w-9 place-items-center rounded-lg border border-subtle bg-surface text-secondary transition hover:bg-surface-sunken hover:text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};

const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
  <ul className="space-y-0.5">
    {NAV_ITEMS.map((item) => (
      <li key={item.to}>
        <NavLink
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-accent-soft text-accent-text"
                : "text-secondary hover:bg-surface-sunken hover:text-primary",
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-accent" : "text-muted",
                )}
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

const SyntheticNotice = () => (
  <p className="rounded-lg border border-subtle bg-surface-sunken p-3 text-2xs leading-5 text-muted">
    <span className="font-semibold text-secondary">Synthetic data.</span> No
    real institution, system or person. No backend, authentication or tracking.
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

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-subtle bg-surface px-3 py-4 lg:flex">
        <NavLink
          to="/"
          className="rounded-lg px-2 py-1.5 transition hover:bg-surface-sunken"
        >
          <Wordmark />
        </NavLink>

        <nav aria-label="Primary" className="mt-6 flex-1">
          <NavList />
        </nav>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-subtle bg-surface-sunken px-3 py-2 text-xs text-muted transition hover:border-strong hover:text-secondary"
          >
            <Command className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="font-mono text-2xs">⌘K</kbd>
          </button>
          <SyntheticNotice />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-subtle bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <NavLink to="/">
          <Wordmark />
        </NavLink>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="grid h-9 w-9 place-items-center rounded-lg border border-subtle bg-surface text-secondary"
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
          className="sticky top-[57px] z-20 border-b border-subtle bg-surface p-3 lg:hidden"
        >
          <NavList onNavigate={() => setMobileNavOpen(false)} />
          <div className="mt-3">
            <SyntheticNotice />
          </div>
        </nav>
      ) : null}

      <div className="lg:pl-64">
        {/* Desktop top bar: theme control lives here, away from the nav list. */}
        <div className="sticky top-0 z-20 hidden justify-end border-b border-subtle bg-canvas/80 px-6 py-2.5 backdrop-blur lg:flex">
          <ThemeToggle />
        </div>

        <main
          id="main"
          className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>

        <footer className="mx-auto max-w-content px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <p className="border-t border-subtle pt-5 text-xs text-muted">
            SignalTower AI — a synthetic portfolio demonstration. Every figure
            shown is derived from the evidence fixture by the engine in{" "}
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

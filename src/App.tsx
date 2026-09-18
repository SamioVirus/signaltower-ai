import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "@/components/AppShell";
import { LandingPage } from "@/pages/LandingPage";

/**
 * Routes are code-split.
 *
 * The charting library is the single largest dependency and only three screens
 * need it, so loading it up front made every visitor pay for pages they might
 * never open. Splitting at the route boundary keeps the first paint small and
 * pulls the rest in on navigation.
 */
const PortfolioPage = lazy(() =>
  import("@/pages/PortfolioPage").then((m) => ({ default: m.PortfolioPage })),
);
const ReadinessPage = lazy(() =>
  import("@/pages/ReadinessPage").then((m) => ({ default: m.ReadinessPage })),
);
const InitiativePage = lazy(() =>
  import("@/pages/InitiativePage").then((m) => ({ default: m.InitiativePage })),
);
const BottlenecksPage = lazy(() =>
  import("@/pages/BottlenecksPage").then((m) => ({
    default: m.BottlenecksPage,
  })),
);
const DecisionsPage = lazy(() =>
  import("@/pages/DecisionsPage").then((m) => ({ default: m.DecisionsPage })),
);
const SimulatorPage = lazy(() =>
  import("@/pages/SimulatorPage").then((m) => ({ default: m.SimulatorPage })),
);
const OperatingModelPage = lazy(() =>
  import("@/pages/OperatingModelPage").then((m) => ({
    default: m.OperatingModelPage,
  })),
);
const MethodologyPage = lazy(() =>
  import("@/pages/MethodologyPage").then((m) => ({
    default: m.MethodologyPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

/**
 * Scroll to the top on navigation, but leave query-string changes alone: a
 * filter change on the readiness board should not yank the page back up.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

/**
 * Route fallback.
 *
 * Deliberately quiet: chunks load in well under a second on any realistic
 * connection, and a full skeleton that flashes for 200ms reads worse than a
 * brief status line.
 */
const RouteFallback = () => (
  <p role="status" aria-live="polite" className="p-6 text-sm text-muted">
    Loading…
  </p>
);

export const App = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppShell />}>
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/readiness" element={<ReadinessPage />} />
          <Route path="/initiatives/:id" element={<InitiativePage />} />
          <Route path="/bottlenecks" element={<BottlenecksPage />} />
          <Route path="/decisions" element={<DecisionsPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/operating-model" element={<OperatingModelPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </>
);

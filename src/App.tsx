import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { BottlenecksPage } from "@/pages/BottlenecksPage";
import { DecisionsPage } from "@/pages/DecisionsPage";
import { EvidencePassportPage } from "@/pages/EvidencePassportPage";
import { LandingPage } from "@/pages/LandingPage";
import { OperatingModelPage } from "@/pages/OperatingModelPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ReadinessPage } from "@/pages/ReadinessPage";

export const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route element={<Layout />}>
      <Route path="/overview" element={<OverviewPage />} />
      <Route path="/readiness" element={<ReadinessPage />} />
      <Route path="/passport" element={<EvidencePassportPage />} />
      <Route path="/bottlenecks" element={<BottlenecksPage />} />
      <Route path="/decisions" element={<DecisionsPage />} />
      <Route path="/operating-model" element={<OperatingModelPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

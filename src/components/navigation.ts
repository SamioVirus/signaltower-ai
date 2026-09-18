import {
  BarChart3,
  FlaskConical,
  GitCompareArrows,
  LayoutDashboard,
  ListChecks,
  Route,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
}

/** Single source of truth for navigation: sidebar, palette and sitemap. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Portfolio",
    to: "/portfolio",
    icon: LayoutDashboard,
    description: "Derived KPIs, stage funnel and the full initiative table",
  },
  {
    label: "Readiness",
    to: "/readiness",
    icon: ListChecks,
    description: "Control evidence matrix and per-initiative readiness",
  },
  {
    label: "Bottlenecks",
    to: "/bottlenecks",
    icon: BarChart3,
    description:
      "Where value is trapped, and which control team is the constraint",
  },
  {
    label: "Decisions",
    to: "/decisions",
    icon: Scale,
    description: "Ranked leadership decisions with the ranking maths shown",
  },
  {
    label: "Simulator",
    to: "/simulator",
    icon: FlaskConical,
    description: "Approve remediations and watch the portfolio re-derive",
  },
  {
    label: "Operating model",
    to: "/operating-model",
    icon: Route,
    description: "The 90-day path from inventory to governed conversion",
  },
  {
    label: "Methodology",
    to: "/methodology",
    icon: GitCompareArrows,
    description: "The scoring policy, gates, weights and model assumptions",
  },
];

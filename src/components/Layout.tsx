import {
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  LayoutDashboard,
  Route,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/cn";

const navItems = [
  { label: "Overview", to: "/overview", icon: LayoutDashboard },
  { label: "Readiness Board", to: "/readiness", icon: ClipboardCheck },
  { label: "Evidence Passport", to: "/passport", icon: FileCheck2 },
  { label: "Bottlenecks", to: "/bottlenecks", icon: BarChart3 },
  { label: "Executive Decisions", to: "/decisions", icon: ShieldCheck },
  { label: "90-Day Model", to: "/operating-model", icon: Route },
];

export const Layout = () => (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-navy px-5 py-6 text-white lg:block">
      <NavLink to="/" className="block rounded-lg p-2 transition hover:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-indigoTailored-500 text-sm font-bold">ST</div>
          <div>
            <div className="text-base font-semibold tracking-tight">SignalTower AI</div>
            <div className="text-xs text-slate-400">Enterprise AI control tower</div>
          </div>
        </div>
      </NavLink>

      <nav className="mt-9 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition",
                "hover:bg-white/7 hover:text-white",
                isActive && "bg-indigoTailored-500/18 text-white ring-1 ring-indigoTailored-400/20",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-5 right-5 rounded-md border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-slate-400">
        Synthetic portfolio demo. No real company data, internal claims, APIs, or tracking.
      </div>
    </aside>

    <div className="lg:pl-72">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="font-semibold text-slate-950">
            SignalTower AI
          </NavLink>
          <NavLink to="/overview" className="rounded-md bg-indigoTailored-600 px-3 py-2 text-xs font-semibold text-white">
            Control Tower
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-[1680px] px-5 py-6 sm:px-7 lg:px-9">
        <Outlet />
      </main>
    </div>
  </div>
);

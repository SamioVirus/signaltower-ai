# SignalTower AI

SignalTower AI is a synthetic executive-facing control tower for enterprise AI commercialization. It shows which AI initiatives are ready for production, which are stuck, why they are stuck, and what leadership decision would unlock the most value fastest.

This is a static portfolio/demo application for regulated enterprises and financial-services institutions. It does not contain real company data, internal claims, private information, APIs, secrets, authentication, tracking, or backend services.

## Why This Exists

Large regulated enterprises often have many AI ideas but struggle to convert pilots into governed production value. The bottleneck is usually not model invention. It is the operating layer between business value, ownership, data readiness, risk review, control evidence, and value realization.

SignalTower AI is an outside-in synthetic portfolio concept inspired by public enterprise AI transformation patterns. It is designed to demonstrate how a disciplined AI operating model can make adoption faster by making governance visible, reusable, measurable, and accountable.

## RF Analogy

In RF engineering, network quality issues behave like interference and noise: they are continuously measured, routed, tuned, and reduced rather than solved once forever. Enterprise AI bottlenecks behave similarly. Governance friction, unclear ownership, weak data quality, missing lineage, and slow approvals raise the noise floor between an AI idea and governed production value.

## What The Demo Shows

- Executive Portfolio with computed KPIs, stage distribution, risk mix, active blockers, and initiative table
- Production Readiness Board with simple local filters and readiness dimensions
- Evidence Passport for the AI Relationship Manager Briefing Assistant
- Bottleneck Drilldown with blocker categories, value trapped, stage-aging heatmap, and control queue load
- Executive Decision View with ranked leadership decisions
- 90-Day Operating Model roadmap for inventory, governance templates, and production conversion

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run typecheck
npm run build
```

The built `dist/` folder can be deployed as a static site to Vercel, Netlify, GitHub Pages, Nginx, or any static host.

## Deployed Demo

[SignalTower AI on Vercel](https://signaltower-f67n7m6ri-samiovirus-projects.vercel.app)

## Portfolio Package

- [Case Study](docs/case-study.md)
- [Demo Script](docs/demo-script.md) - polished external presentation script
- [Walkthrough](docs/walkthrough.md) - concise internal run-of-show and speaker notes
- [LinkedIn Post Guidance](docs/linkedin-post-guidance.md) - positioning, structure, confidentiality guardrails, and next-post briefs

## Demo Data Disclaimer

This prototype uses synthetic data only. It does not contain internal data from any company or financial institution. It is designed to demonstrate an outside-in operating model concept for governed AI commercialization in regulated enterprises.

## Executive Walkthrough

Start on the landing page, then open the Executive Portfolio. Explain that the organization has 12 active AI initiatives and roughly $18M in annual value at stake, but only a small number are production-ready. Move to the Readiness Board to show that readiness includes sponsor clarity, KPI baseline, data readiness, lineage, security, privacy, model risk, human review, monitoring, and value tracking.

Open the Evidence Passport for the Relationship Manager Briefing Assistant. Show that the use case has strong value but cannot responsibly move forward because two upstream data fields lack lineage ownership. Move to Bottlenecks to show repeated blockers across the portfolio. End on Executive Decisions to show the concrete decisions leadership can make this week.

## Future Roadmap

- Jira, ServiceNow, GRC, and data catalog integrations
- Model inventory and monitoring integration
- Automated evidence collection
- AI-assisted risk classification
- Approval workflow integration
- Executive reporting export
- Use-case duplication detection
- Value realization forecasting
- Agentic AI control templates
- Audit-ready evidence packets

# SignalTower AI Walkthrough

Purpose: concise run-of-show and speaker notes. For the polished external version see
[demo-script.md](demo-script.md); for the engineering, see [architecture.md](architecture.md).

## 30-second version

SignalTower is a control tower for enterprise AI commercialisation. It shows which AI initiatives
are ready for production, which are stuck, what specifically is stopping them, and which leadership
decision would release the most value soonest.

The thesis: regulated enterprises do not lack AI ideas. They lack an operating layer that converts
AI demand into governed production value — and the friction is almost always the control evidence,
not the model.

## 2-minute version

**Portfolio.** Twelve active initiatives, $18.4M of annual value at stake, three production-ready.
Lead with the divergence: readiness averages 67%, but 62% once weighted by value. The bigger bets
are the less ready ones.

**Readiness.** Open the control matrix — twelve controls across every initiative. The vertical
stripes are the point: these are gaps that several teams are each solving separately. Note that
readiness is not a model-quality score; it is sponsor clarity, KPI baseline, data readiness,
lineage, security, privacy, model risk, human oversight, monitoring and value tracking, weighted by
risk tier.

**Evidence passport.** Open the Relationship Manager Briefing Assistant. Strong value, 69% ready,
and it cannot responsibly advance because two upstream relationship-data fields have no documented
owner. Scroll to "How this score was produced" — the score can be taken apart control by control.
Point out the control debt banner: this initiative is sitting in Control Review, a stage that
required data quality and lineage, neither of which was ever approved.

**Bottlenecks.** Where value is trapped, and which review function is the actual constraint. This
is the shift from treating each delay as an escalation to treating the repeated ones as an
operating-model problem.

**Decisions.** A ranked queue. The top item is usually systemic: one control blocking several
initiatives at once, where the answer is to build the pattern once rather than schedule N reviews.
Every card shows the value, effort, confidence, urgency and leverage that produced its position.

**Simulator.** Close here. Tick the remediations, or load the top three decisions, and watch the
whole portfolio re-derive — readiness, gates, stage promotions, the conversion forecast. Same
engine, modified evidence, no second model.

## Closing line

The goal is not to bypass governance. It is to make governance visible, reusable, measurable and
fast enough to support production AI adoption — and to make the numbers leaders act on something
they can interrogate rather than something they have to trust.

## If asked about the engineering

Nothing in the data file is a score. It records control evidence — state, owner, age — and a tested
engine derives readiness, blockers, gate verdicts, the decision ranking and the forecast. That is
what makes the simulator possible and what makes the scoring challengeable. 307 unit tests, 56
end-to-end tests, zero accessibility violations at WCAG 2.1 AA.

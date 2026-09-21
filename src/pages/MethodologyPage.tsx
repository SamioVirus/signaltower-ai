import { Page, PageHeader } from "@/components/ui/PageHeader";
import {
  Panel,
  PanelBody,
  PanelHeader,
  Section,
  SectionTitle,
} from "@/components/ui/Primitives";
import { DEFAULT_CREDIT, DEFAULT_POLICY } from "@/engine/policy";
import { TEMPLATE_REUSE_FACTOR } from "@/engine/forecast";
import { RISK_TIERS } from "@/engine/types";
import { EVIDENCE_TONES } from "@/lib/evidence-display";
import { formatPercent } from "@/lib/format";

/**
 * Methodology.
 *
 * The policy table is rendered from the policy object itself, so this page
 * cannot drift from the scoring. If somebody changes a weight, this page says
 * so without anyone remembering to update it.
 */
export const MethodologyPage = () => (
  <Page>
    <PageHeader
      eyebrow="Methodology"
      title="How every number on this site is produced"
      lede="SignalTower stores control evidence and derives everything else. This page is generated from the policy object the engine actually executes, so it cannot fall out of step with the scoring."
    />

    <Section>
      <SectionTitle
        title="The data model"
        description="What is recorded, and what is computed."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-t border-subtle pt-4">
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Stored as evidence
          </p>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            {[
              "The state of each control artifact: missing, in progress, partial, approved, or not applicable",
              "Who owns each artifact and how long it has sat at its current state",
              "A short factual note describing what exists today",
              "Stage, risk tier, sponsor-estimated annual value, data classification and model characteristics",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ok"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-subtle pt-4">
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
            Derived by the engine
          </p>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            {[
              "Readiness score and band, with a per-control contribution breakdown",
              "Stage-gate verdicts, blockers, and control debt",
              "Portfolio patterns and which controls are systemic",
              "The ranked decision queue and the conversion forecast",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>

    <Section>
      <SectionTitle
        title="Evidence credit"
        description="How much readiness credit each state earns before weighting."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          Object.keys(DEFAULT_CREDIT) as Array<keyof typeof DEFAULT_CREDIT>
        ).map((state) => (
          <div key={state} className="border-t border-subtle pt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-primary">
                {EVIDENCE_TONES[state].label}
              </span>
              <span data-metric className="text-sm font-semibold text-accent">
                {formatPercent(DEFAULT_CREDIT[state] * 100)}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              {EVIDENCE_TONES[state].description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-l-2 border-accent pl-3.5 py-1 text-xs leading-5 text-muted">
        <span className="font-semibold text-secondary">
          Not applicable is not a pass.
        </span>{" "}
        An inapplicable control is removed from the denominator entirely. A
        workflow that takes no action is neither rewarded nor penalised for
        lacking autonomy controls; an agentic one is scored against them in
        full.
      </div>
    </Section>

    <Panel as="section" aria-labelledby="catalogue-title">
      <PanelHeader
        id="catalogue-title"
        title={`Control catalogue — policy ${DEFAULT_POLICY.version}`}
        description="Weights vary by risk tier. The gate column is the stage by which a control must be approved."
      />
      <PanelBody>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <caption className="sr-only">
              Every control, its gate, its remediation cost and its weight per
              risk tier
            </caption>
            <thead>
              <tr className="border-b border-subtle text-2xs uppercase tracking-wider text-muted">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Control
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Gate
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">
                  Effort
                </th>
                {RISK_TIERS.map((tier) => (
                  <th
                    key={tier}
                    scope="col"
                    className="py-2 pr-3 text-right font-semibold"
                  >
                    {tier}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {DEFAULT_POLICY.controls.map((control) => (
                <tr key={control.id}>
                  <th scope="row" className="py-3 pr-4 font-normal">
                    <span className="block font-medium text-primary">
                      {control.label}
                    </span>
                    <span className="block max-w-md text-xs leading-5 text-muted">
                      {control.description}
                    </span>
                    {control.appliesWhen ? (
                      <span className="mt-1 inline-block rounded bg-surface-sunken px-1.5 py-0.5 text-2xs text-muted ring-1 ring-subtle">
                        Conditional
                      </span>
                    ) : null}
                  </th>
                  <td className="py-3 pr-4 align-top text-secondary">
                    {control.gate}
                  </td>
                  <td
                    data-metric
                    className="py-3 pr-4 text-right align-top text-secondary"
                  >
                    {control.remediation.effortDays}d
                  </td>
                  {RISK_TIERS.map((tier) => (
                    <td
                      key={tier}
                      data-metric
                      className="py-3 pr-3 text-right align-top font-medium text-primary"
                    >
                      {control.weight[tier].toFixed(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelBody>
    </Panel>

    <Section>
      <SectionTitle
        title="Model assumptions"
        description="Stated plainly, because they are choices."
      />
      <dl className="space-y-4 text-sm">
        <Assumption
          term="Readiness"
          detail="A weighted percentage of achievable control credit. It measures evidence completeness, not the quality of the underlying work, and a perfectly scored initiative can still be a bad idea."
        />
        <Assumption
          term="Ageing"
          detail={`Blocker severity is amplified by up to 2x as evidence ages, saturating at ${DEFAULT_POLICY.ageSaturationDays} days. Without a ceiling one very old item would dominate every ranking.`}
        />
        <Assumption
          term="Systemic threshold"
          detail={`A control becomes systemic once it blocks ${DEFAULT_POLICY.systemicThreshold} or more initiatives at their next gate at the same time. Counting everything still outstanding somewhere would mark nearly every control systemic, which is no signal at all.`}
        />
        <Assumption
          term="Confidence"
          detail="Derived from readiness as a proxy for how likely remediation is to convert the initiative. It is a heuristic, not a probability drawn from historical conversion data — there is none, because the portfolio is synthetic."
        />
        <Assumption
          term="Forecast capacity"
          detail="A fixed number of control-team days per week, spent on the front of the queue. Both strategies get identical capacity and both finish one initiative before starting the next; only the ordering differs. The ranked queue orders by value per remaining day of effort — weighted shortest processing time — while the oldest-first queue ignores value and cost entirely."
        />
        <Assumption
          term="Template reuse"
          detail={`In the value-ranked queue, applying a systemic control a second time costs ${Math.round(TEMPLATE_REUSE_FACTOR * 100)}% of building it from scratch. The oldest-first queue pays full price every time, because working ticket by ticket is precisely what stops anyone noticing the pattern. This assumption favours the ranked queue, and it is the main reason it wins.`}
        />
        <Assumption
          term="Stage promotion"
          detail="Evidence can carry an initiative as far as Production Ready. Going live is a release decision with an operational tail, not another artifact, so no simulation promotes past that point."
        />
      </dl>
    </Section>

    <Section>
      <SectionTitle title="What this is not" />
      <ul className="space-y-2.5 text-sm leading-6 text-secondary">
        {[
          "It is not real data. Every initiative, owner, metric and value is synthetic, and no real institution or system is represented.",
          "It is not a risk assessment. The control catalogue is a plausible composite, not any specific regulatory framework.",
          "It is not a prediction. The forecast is a deterministic queue model whose purpose is to make the cost of poor sequencing visible.",
          "It has no backend. There is no API, no authentication, no database and no tracking — the entire application is a static bundle.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  </Page>
);

const Assumption = ({ term, detail }: { term: string; detail: string }) => (
  <div className="border-l-2 border-accent pl-4">
    <dt className="font-semibold text-primary">{term}</dt>
    <dd className="mt-1 max-w-measure leading-6 text-muted">{detail}</dd>
  </div>
);

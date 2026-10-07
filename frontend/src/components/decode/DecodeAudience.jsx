import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { CheckCircle2, Gift, FlaskConical, Trophy, Target } from "lucide-react";

const EXPECTATIONS = [
  "A complete learning system you study and apply — not a shortcut or overnight formula",
  "Frameworks that guide your testing — your own experiments still matter",
  "Real campaign examples that show how decisions are made — not promises of specific outcomes",
  "Principles you adapt to your product and market — not a rigid one-size-fits-all template",
  "Original workflows, checklists and case studies — no recycled internet content",
];

const CASE_STUDIES = [
  { icon: FlaskConical, title: "Campaign Setup Context", text: "Understand why the campaign was structured a particular way — objective, audiences, budgets and creative logic.", image: "/samples/case-campaign.webp" },
  { icon: Target, title: "Ad Set Winners & Losers", text: "Compare performance across ad sets and understand what the data actually means before making decisions.", image: "/samples/case-adset.webp" },
  { icon: Trophy, title: "Ad-Level Winner", text: "See why an individual creative can outperform inside an ad set — and how to act on it.", image: "/samples/case-adlevel.webp" },
];

export function AudienceSection({ product }) {
  const whoFor = product?.who_for || [];
  const notFor = product?.not_for || [];
  return (
    <section className="py-16 sm:py-24" data-testid="audience-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Who This Is For"
          title="Made for People Who Want the Whole System"
          testId="audience"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {whoFor.map((aud, i) => (
            <Reveal key={aud.title} delay={i * 0.05}>
              <div className="card-lift h-full rounded-xl border border-slate-200 bg-white p-6" data-testid={`audience-card-${i}`}>
                <h3 className="font-display text-base font-bold text-ink">{aud.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{aud.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-8" data-testid="not-for-card">
              <span className="eyebrow">Read This First</span>
              <h3 className="mt-3 font-display text-xl font-bold text-ink sm:text-2xl">Go In With the Right Expectations</h3>
              <ul className="mt-6 space-y-3">
                {EXPECTATIONS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-lg bg-brand-50 p-4 text-sm font-medium leading-relaxed text-brand-900 ring-1 ring-brand-200">
                It's built to make you a sharper, more confident operator — the results come from how you apply it to your own business.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-2xl bg-ink-surface p-8 ring-1 ring-white/10" data-testid="bonus-toolkit-card">
              <span className="eyebrow-dark">Bonus Toolkit</span>
              <h3 className="mt-3 font-display text-xl font-bold text-white sm:text-2xl">Included With the Guide</h3>
              <ul className="mt-6 flex-1 space-y-3">
                {(product?.bonuses || []).map((bonus, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Gift className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    <span>{bonus}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Printable • Reusable • Designed for reference
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function CaseStudiesSection() {
  return (
    <section className="bg-white py-16 sm:py-24" data-testid="case-studies-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Real Case Studies"
          title="See How Campaign Decisions Are Broken Down"
          description="Real campaign breakdowns from inside the guide — actual Ads Manager data, explained decision by decision."
          testId="case-studies"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CASE_STUDIES.map((cs, i) => (
            <Reveal key={cs.title} delay={i * 0.07}>
              <div className="card-lift flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#FAFAFA]" data-testid={`case-study-${i}`}>
                <img src={cs.image} alt={cs.title} loading="lazy" className="w-full border-b border-slate-200 object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-base font-bold text-ink">{cs.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cs.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

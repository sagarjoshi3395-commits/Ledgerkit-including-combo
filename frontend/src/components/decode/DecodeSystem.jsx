import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import WorkflowSteps from "../WorkflowSteps";
import { AlertCircle, ArrowDown, LineChart, ShieldAlert, Puzzle, Calculator, GitBranch } from "lucide-react";

const CHALLENGES = [
  "Not knowing which digital product idea to pursue",
  "Building products before validating demand",
  "Copying competitors instead of studying them",
  "Confusing campaign metrics",
  "Changing campaigns too quickly",
  "Testing without a hypothesis",
  "Scaling before unit economics make sense",
  "Looking only at ROAS instead of actual business profitability",
  "Not understanding where buyers drop from the funnel",
];

const EXPERIENCE_CARDS = [
  { icon: LineChart, title: "Real Campaign Analysis", text: "Learn how actual campaign results are interpreted — not cherry-picked screenshots, but the reasoning behind the numbers." },
  { icon: ShieldAlert, title: "Real Mistakes", text: "See decisions that did not work and exactly what was learned from them." },
  { icon: Puzzle, title: "Practical Frameworks", text: "Repeatable testing and diagnostic systems you can apply to your own campaigns." },
  { icon: Calculator, title: "Real Business Economics", text: "Understand CPA, AOV, profitability, cash flow and what revenue actually looks like after the dashboard." },
  { icon: GitBranch, title: "Complete Workflow", text: "Follow the full journey — from product research to expansion — as one connected system." },
];

export function ExperienceSection() {
  return (
    <section className="py-16 sm:py-24" data-testid="experience-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Experience, Structured"
          title="Built From 3 Years of Doing — Not Just Reading"
          description="Over the last 3 years, different digital products, creatives, audiences, landing pages, campaign structures and scaling approaches were practically tested. Some worked. Some failed. Some looked good in Ads Manager but made less sense after calculating actual business economics. Those experiences became the frameworks inside this guide — so you understand not only what to do, but why."
          testId="experience"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {EXPERIENCE_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06}>
              <div className="card-lift h-full rounded-xl border border-slate-200 bg-white p-6" data-testid={`experience-card-${i}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <card.icon className="h-5 w-5 text-brand-600" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="bg-white py-16 sm:py-24" data-testid="problem-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="The Real Problem"
          title="Running Ads Is Easy. Understanding What to Do Next Is Harder."
          description="Most advertisers don't fail because they can't launch a campaign. They struggle because nobody explains what the numbers mean — and what decision to make next."
          testId="problem"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGES.map((item, i) => (
            <Reveal key={item} delay={i * 0.04}>
              <div className="flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-[#FAFAFA] p-5" data-testid={`problem-card-${i}`}>
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600" />
                <span className="text-sm font-medium leading-relaxed text-slate-700">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
          <ArrowDown className="h-5 w-5 animate-pulse-dot text-brand-600" />
          <p className="max-w-2xl text-base font-medium text-ink md:text-lg">
            Sales Engine replaces guessing with a structured operating framework — the same workflow used across 3 years of real campaigns.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function SystemSection() {
  return (
    <section className="ink-section dot-grid-dark py-16 sm:py-24" data-testid="system-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="The Complete System"
          title="One Connected Workflow — From Idea to Expansion"
          description="Every part of the guide maps to a stage of this system. Nothing is taught in isolation."
          dark
          testId="system"
        />
        <div className="mt-12">
          <WorkflowSteps />
        </div>
      </div>
    </section>
  );
}

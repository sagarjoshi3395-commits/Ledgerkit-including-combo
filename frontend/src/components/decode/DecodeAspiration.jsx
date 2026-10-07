import { Reveal } from "../Reveal";
import { Compass, LineChart, TrendingUp, Brain } from "lucide-react";

const UNLOCKS = [
  { icon: Compass, title: "Launch With Clarity", text: "Know which idea deserves your time before you spend weeks building it." },
  { icon: LineChart, title: "Read Your Numbers", text: "Open Ads Manager and actually understand the story your metrics are telling." },
  { icon: TrendingUp, title: "Scale With Control", text: "Know when to push budget — and when to fix the funnel first." },
  { icon: Brain, title: "Build Skills That Compound", text: "Product, marketing and measurement skills you keep forever, long after one launch." },
];

export default function AspirationSection() {
  return (
    <section className="py-16 sm:py-24" data-testid="aspiration-section">
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Why It Matters</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" data-testid="aspiration-title">
              Imagine Knowing Exactly <span className="highlight-brush">What to Do Next</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Most people don't fail at digital products because they're lazy — they fail because nobody showed them the full map. One guide that connects research, creation, selling and scaling changes how every decision feels: calmer, clearer, deliberate.
            </p>
            <p className="mt-4 font-display text-lg font-bold text-ink">
              One system. Every stage. Yours to revisit forever.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {UNLOCKS.map((u, i) => (
              <Reveal key={u.title} delay={i * 0.06}>
                <div className="card-lift h-full rounded-xl border border-slate-200 bg-white p-6" data-testid={`aspiration-card-${i}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-surface">
                    <u.icon className="h-5 w-5 text-brand-400" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{u.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{u.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

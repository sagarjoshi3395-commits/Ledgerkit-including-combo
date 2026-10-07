import { useState } from "react";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import CurriculumAccordion from "../CurriculumAccordion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { ImagePlus, Check, LayoutGrid, Camera, FileText, ListChecks, GitFork, FileStack, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SCREENSHOT_SLOTS = [
  "Ads Manager screenshots", "Campaign results", "Ad-set comparison screenshots",
  "Ad-level results", "Product research screenshots", "Meta Ad Library references",
  "Landing-page examples", "Pixel / tracking examples", "Funnel screenshots",
];

const VISUAL_TOOLS = [
  { icon: GitFork, title: "Frameworks", text: "Decision-making systems for testing and optimization." },
  { icon: Camera, title: "Screenshots", text: "Campaign examples that connect concepts to real interfaces." },
  { icon: FileText, title: "Cheat Sheets", text: "Fast references for important metrics." },
  { icon: ListChecks, title: "Checklists", text: "Repeatable processes for launching and reviewing campaigns." },
  { icon: LayoutGrid, title: "Decision Trees", text: "Understand what to investigate when performance changes." },
  { icon: FileStack, title: "Templates", text: "Reusable testing and review systems." },
];

export function RealWorldSection() {
  return (
    <section className="py-16 sm:py-24" data-testid="real-world-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Real-World Learning"
          title="Not Just Theory — See How Decisions Look Inside Real Campaigns"
          description="The guide uses practical examples and campaign analysis to demonstrate concepts. Real screenshots are added as they are provided — never fabricated, with sensitive values blurred where required."
          testId="real-world"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCREENSHOT_SLOTS.map((slot, i) => (
            <Reveal key={slot} delay={i * 0.04}>
              <div
                className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center"
                data-testid={`screenshot-slot-${i}`}
              >
                <ImagePlus className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">{slot}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Genuine screenshot slot</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SamplePagesSection({ product }) {
  const pages = (product?.sample_pages || []).filter((p) => p.image);
  const [open, setOpen] = useState(null);
  if (!pages.length) return null;
  const current = open !== null ? pages[open] : null;

  return (
    <section id="samples" className="ink-section dot-grid-dark scroll-mt-20 overflow-hidden py-16 sm:py-24" data-testid="samples-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Preview Inside"
          title="A Look Inside the Actual Guide"
          description="A quick flow through a few real pages — the remaining 130+ pages stay exclusive to buyers."
          dark
          testId="samples"
        />
      </div>
      <div className="marquee-paused mt-12 overflow-hidden" data-testid="sample-flow">
        <div className="animate-marquee flex w-max gap-5 pr-5">
          {[...pages, ...pages].map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i % pages.length)}
              data-testid={i < pages.length ? `sample-thumb-${i}` : undefined}
              style={{ transform: i % 2 ? "rotate(1.4deg)" : "rotate(-1.4deg)" }}
              className="w-60 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-white/15 transition-transform duration-200 hover:-translate-y-1.5 sm:w-72"
            >
              <img src={p.image} alt={p.title} loading="lazy" className="aspect-[3/4] w-full object-cover object-top" />
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        Tap any page to preview • Hover to pause
      </p>

      <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-lg p-4" data-testid="sample-dialog">
          {current && (
            <div>
              <DialogTitle className="font-display text-base font-bold text-ink">{current.title}</DialogTitle>
              <DialogDescription className="sr-only">Sample page preview from Meta Ads Decode</DialogDescription>
              <img src={current.image} alt={current.title} className="mt-3 w-full rounded-lg ring-1 ring-slate-200" />
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpen((open - 1 + pages.length) % pages.length)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-ink hover:bg-slate-200"
                  data-testid="sample-dialog-prev"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{open + 1} / {pages.length} preview pages</span>
                <button
                  type="button"
                  onClick={() => setOpen((open + 1) % pages.length)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-ink hover:bg-slate-200"
                  data-testid="sample-dialog-next"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function IncludedSection({ product }) {
  const items = product?.whats_included || [];
  if (!items.length) return null;
  return (
    <section className="bg-white py-16 sm:py-24" data-testid="included-section">
      <div className="container-site">
        <SectionHeading eyebrow="What's Included" title="Everything You Get" testId="included" />
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className="flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-[#FAFAFA] p-5" data-testid={`included-item-${i}`}>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </span>
                <span className="text-sm font-medium leading-relaxed text-slate-700">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CurriculumSection({ product }) {
  return (
    <section id="curriculum" className="scroll-mt-20 py-16 sm:py-24" data-testid="curriculum-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="What You'll Learn"
          title="The Complete Curriculum — 13 Parts + Bonus Toolkit + Case Studies"
          description="Expand any part to see exactly what's inside. From research to business measurement, every stage of the system is covered."
          testId="curriculum"
        />
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500" data-testid="curriculum-path-strip">
            {["Research", "Product", "Ads", "Analysis", "Scaling", "Business Measurement"].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="text-ink">{s}</span>
                {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-brand-500" />}
              </span>
            ))}
          </div>
        </Reveal>
        <div className="mt-8">
          <CurriculumAccordion curriculum={product?.curriculum || []} />
        </div>
      </div>
    </section>
  );
}

export function VisualToolsSection() {
  return (
    <section className="bg-white py-16 sm:py-24" data-testid="visual-tools-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Visual Learning Tools"
          title="Built to Be Used — Not Just Read Once"
          description="The guide doubles as a working reference. Keep the frameworks, cheat sheets and checklists next to Ads Manager."
          testId="visual-tools"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VISUAL_TOOLS.map((tool, i) => (
            <Reveal key={tool.title} delay={i * 0.05}>
              <div className="card-lift h-full rounded-xl border border-slate-200 bg-[#FAFAFA] p-6" data-testid={`visual-tool-${i}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-surface">
                  <tool.icon className="h-5 w-5 text-brand-400" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

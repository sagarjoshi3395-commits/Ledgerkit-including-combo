import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileImage } from "lucide-react";

function PageArt({ page, large = false }) {
  if (page.image) {
    return <img src={page.image} alt={page.title} loading="lazy" className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
        <span className="rounded-full bg-ink-surface px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-brand-400">{page.kind}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">{page.label}</span>
      </div>
      <div className={`flex flex-1 flex-col ${large ? "p-6 sm:p-8" : "p-3"}`}>
        <div className={`font-display font-bold leading-snug text-ink ${large ? "text-base sm:text-lg" : "text-[9px]"}`}>{page.title}</div>
        <div className={`space-y-1.5 ${large ? "mt-4" : "mt-2"}`}>
          {[92, 100, 78, 96, 60].map((w, i) => (
            <div key={i} className={`rounded bg-slate-100 ${large ? "h-2" : "h-1"}`} style={{ width: `${w}%` }} />
          ))}
        </div>
        {large && (
          <div className="mt-auto flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
            <FileImage className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span className="font-mono text-[10px] text-amber-700">Placeholder — the real page preview appears here once uploaded</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SamplePageViewer({ pages = [], dark = true }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  if (!pages.length) return null;
  const page = pages[active];

  return (
    <div data-testid="sample-page-viewer">
      <div className="relative mx-auto max-w-2xl">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/15 sm:aspect-[4/4.6]">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PageArt page={page} large />
          </motion.div>
        </div>
        <button
          type="button"
          aria-label="Previous sample page"
          data-testid="sample-prev-button"
          onClick={() => setActive((a) => (a - 1 + pages.length) % pages.length)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-ink shadow-lg ring-1 ring-slate-200 transition-colors hover:bg-slate-50 sm:-left-5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next sample page"
          data-testid="sample-next-button"
          onClick={() => setActive((a) => (a + 1) % pages.length)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 text-ink shadow-lg ring-1 ring-slate-200 transition-colors hover:bg-slate-50 sm:-right-5"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-2" data-testid="sample-thumbnails">
        {pages.map((p, i) => (
          <button
            key={p.label + i}
            type="button"
            onClick={() => setActive(i)}
            data-testid={`sample-thumb-${i}`}
            className={`w-20 shrink-0 snap-start overflow-hidden rounded-lg ring-2 transition-shadow duration-200 ${
              i === active ? "ring-brand-500" : "ring-white/10 hover:ring-white/30"
            }`}
          >
            <div className="aspect-[3/4]">
              <PageArt page={p} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

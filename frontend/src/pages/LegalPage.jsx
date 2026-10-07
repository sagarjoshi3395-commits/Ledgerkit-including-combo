import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { LEGAL_PAGES } from "../lib/legalContent";
import { ArrowRight } from "lucide-react";

/** Renders text, highlighting [EDITABLE PLACEHOLDERS] so business details are easy to spot and replace. */
function RichText({ text }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span key={i} className="placeholder-token">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function LegalPage() {
  const { slug } = useParams();
  const page = LEGAL_PAGES[slug];

  if (!page) {
    return (
      <div className="container-site py-24 text-center" data-testid="legal-not-found">
        <h1 className="font-display text-3xl font-extrabold text-ink">Page not found</h1>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">Back to home <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <main className="py-14 sm:py-20" data-testid={`legal-page-${slug}`}>
      <Seo title={page.title} description={page.intro.replace(/\[[^\]]+\]/g, "").slice(0, 155)} path={`/legal/${slug}`} />
      <div className="container-site max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" data-testid="legal-title">{page.title}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-400"><RichText text={page.updated} /></p>
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 sm:text-base" data-testid="legal-intro">
          <RichText text={page.intro} />
        </p>
        <div className="mt-8 space-y-8">
          {page.sections.map((section, i) => (
            <section key={i} data-testid={`legal-section-${i}`}>
              <h2 className="font-display text-lg font-bold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-sm leading-relaxed text-slate-600"><RichText text={para} /></p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-lg bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200" data-testid="legal-placeholder-note">
          Highlighted <span className="placeholder-token">[PLACEHOLDERS]</span> are editable business-specific fields. Replace them with your exact details before going live.
        </p>
      </div>
    </main>
  );
}

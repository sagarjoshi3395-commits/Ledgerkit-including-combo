import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import FaqAccordion from "../components/FaqAccordion";
import { SITE_FAQS } from "../lib/siteContent";
import { ArrowRight } from "lucide-react";

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <main className="py-14 sm:py-20" data-testid="faq-page">
      <Seo title="FAQ" description="Frequently asked questions about LedgerKit digital guides, delivery, payments and refunds." path="/faq" jsonLd={faqJsonLd} />
      <div className="container-site max-w-3xl">
        <span className="eyebrow">Help Centre</span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl" data-testid="faq-title">Frequently Asked Questions</h1>
        <div className="mt-10">
          <FaqAccordion items={SITE_FAQS} testId="site-faq" />
        </div>
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 text-center" data-testid="faq-contact-cta">
          <p className="text-sm text-slate-600">Still have a question?</p>
          <Link to="/contact" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ink-surface px-6 py-3 text-sm font-semibold text-white hover:bg-ink" data-testid="faq-contact-link">
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

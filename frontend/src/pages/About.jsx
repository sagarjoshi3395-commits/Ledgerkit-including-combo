import Seo from "../components/Seo";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Eye, RefreshCw } from "lucide-react";

const PRINCIPLES = [
  { icon: BookOpen, title: "Practical Over Theoretical", text: "We publish systems readers can understand and apply — not abstract theory or recycled internet content." },
  { icon: Eye, title: "Show, Don't Just Tell", text: "Screenshots, diagrams, frameworks and real examples accompany important concepts in every guide." },
  { icon: RefreshCw, title: "Designed for Reference", text: "Our resources are built to be returned to — checklists, cheat sheets and workflows you keep next to your work." },
];

export default function About() {
  return (
    <main data-testid="about-page">
      <Seo title="About Us" description="Decode creates practical digital educational products, guides and tools that simplify complex business and marketing subjects into understandable systems." path="/about" />
      <section className="border-b border-slate-200 bg-white py-16 sm:py-24">
        <div className="container-site max-w-3xl">
          <span className="eyebrow">About Us</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl" data-testid="about-title">
            We Turn Complex Subjects Into Understandable Systems
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600 md:text-lg">
            LedgerKit creates practical digital educational products — guides, ebooks, templates and tools — designed to simplify complicated business, marketing and advertising topics into structured, step-by-step systems.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Our work is built around practical workflows and real examples rather than theory alone. We believe educational products should be honest about what they can and cannot do — which is why you won't find income promises, fabricated reviews or fake urgency here.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24" data-testid="about-principles">
        <div className="container-site">
          <SectionHeading eyebrow="How We Work" title="Our Publishing Principles" testId="principles" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07}>
                <div className="card-lift h-full rounded-xl border border-slate-200 bg-white p-7">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <p.icon className="h-5 w-5 text-brand-600" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <img
              src="https://images.pexels.com/photos/8534382/pexels-photo-8534382.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Minimalist digital education workspace"
              loading="lazy"
              className="w-full rounded-2xl border border-slate-200 object-cover shadow-subtle"
              data-testid="about-image"
            />
          </Reveal>
          <div>
            <span className="eyebrow">Our Flagship Guide</span>
            <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Meta Ads Decode</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Our flagship guide condenses 3 years of hands-on experience with digital products, Meta Ads, product testing, campaign analysis, landing pages, offers and scaling into one complete practical system — available as a digital edition, a printed book, or both.
            </p>
            <Link to="/meta-ads-decode" data-testid="about-decode-link" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink-surface px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink">
              Explore the Guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { BookMockup } from "../components/BookMockup";
import ProductCard from "../components/ProductCard";
import Testimonials from "../components/Testimonials";
import { VALUE_CARDS, WHY_DIFFERENT, LEARN_VISUALLY_ITEMS } from "../lib/siteContent";
import { ArrowRight, Compass, Package, Megaphone, BarChart3, Award, Eye, Workflow, BookmarkCheck } from "lucide-react";

const VALUE_ICONS = { research: Compass, offer: Package, ads: Megaphone, measure: BarChart3 };
const WHY_ICONS = [Award, Eye, Workflow, BookmarkCheck];

function HomeHero() {
  return (
    <section className="dot-grid relative overflow-hidden border-b border-slate-200" data-testid="home-hero">
      <div className="container-site grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
        <div>
          <Reveal>
            <span className="eyebrow" data-testid="home-hero-eyebrow">Practical Digital Guides</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl" data-testid="home-hero-title">
              Real Systems.<br />Actionable <span className="text-brand-600">Learning.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg" data-testid="home-hero-desc">
              We turn complicated business, marketing and digital-product concepts into practical, step-by-step resources — built around real workflows, visual frameworks and honest expectations.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" data-testid="home-explore-products-button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-surface px-7 py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink">
                Explore Products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/meta-ads-decode" data-testid="home-view-decode-button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-4 text-sm font-semibold text-ink ring-1 ring-slate-300 transition-colors duration-200 hover:bg-slate-50">
                View Sales Engine
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="relative mx-auto hidden sm:block" data-testid="home-hero-visual">
          <div className="relative flex justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-subtle">
            <div className="animate-float-soft">
              <BookMockup size="lg" coverImage="/samples/sales-engine-cover.webp" />
            </div>
            <div className="absolute -left-3 top-8 w-40 rounded-xl border border-slate-200 bg-white p-3 shadow-subtle">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-widest text-brand-600">Framework</div>
              <div className="mt-2 space-y-1.5">
                {[85, 60, 72].map((w, i) => <div key={i} className="h-1.5 rounded bg-slate-100" style={{ width: `${w}%` }} />)}
              </div>
            </div>
            <div className="absolute -right-3 bottom-10 w-40 rounded-xl border border-slate-200 bg-white p-3 shadow-subtle">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-widest text-brand-600">Checklist</div>
              <div className="mt-2 space-y-1.5">
                {[70, 90, 55].map((w, i) => <div key={i} className="h-1.5 rounded bg-slate-100" style={{ width: `${w}%` }} />)}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedProduct({ product }) {
  if (!product) return null;
  const previews = (product.sample_pages || []).slice(0, 3);
  return (
    <section className="ink-section dot-grid-dark py-16 sm:py-24" data-testid="featured-product-section">
      <div className="container-site grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="eyebrow-dark">Featured Product</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl" data-testid="featured-product-title">
              {product.title}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              A complete digital product playbook — from idea research and product creation to launch, tracking and ad scaling — with real Meta Ads campaign examples inside. Built from 3 years of practical experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["13 Parts", "Real Case Studies", "Bonus Toolkit", "Printable Frameworks"].map((chip) => (
                <span key={chip} className="rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-white/10">{chip}</span>
              ))}
            </div>
            <Link to="/meta-ads-decode" data-testid="featured-explore-button" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700">
              Explore Meta Ads Decode <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4" data-testid="featured-sample-previews">
          {previews.map((page, i) => (
            <Reveal key={page.label} delay={i * 0.1}>
              <div className={`overflow-hidden rounded-lg bg-white ring-1 ring-white/15 ${i === 1 ? "translate-y-6" : ""}`}>
                <div className="border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                  <span className="font-mono text-[8px] font-semibold uppercase tracking-widest text-brand-600">{page.kind}</span>
                </div>
                <div className="p-3">
                  <div className="font-display text-[10px] font-bold leading-tight text-ink">{page.title}</div>
                  <div className="mt-2 space-y-1">
                    {[90, 70, 80].map((w, j) => <div key={j} className="h-1 rounded bg-slate-100" style={{ width: `${w}%` }} />)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["products", "home"],
    queryFn: async () => (await api.get("/products")).data,
    staleTime: 60_000,
  });
  const featured = products.find((p) => p.slug === "meta-ads-decode") || products.find((p) => p.featured);

  return (
    <main data-testid="home-page">
      <Seo
        title="Practical Digital Guides"
        description="Practical digital guides, ebooks and templates that turn business, marketing and Meta Ads concepts into step-by-step systems. Featuring the Meta Ads Decode Guide."
        path="/"
      />
      <HomeHero />
      <FeaturedProduct product={featured} />

      <section className="py-16 sm:py-24" data-testid="value-section">
        <div className="container-site">
          <SectionHeading eyebrow="What You'll Find Here" title="Guides Across the Whole Journey" testId="value" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_CARDS.map((card, i) => {
              const Icon = VALUE_ICONS[card.key];
              return (
                <Reveal key={card.key} delay={i * 0.06}>
                  <div className="card-lift h-full rounded-xl border border-slate-200 bg-white p-6" data-testid={`value-card-${card.key}`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                      <Icon className="h-5 w-5 text-brand-600" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-ink">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" data-testid="browse-products-section">
        <div className="container-site">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow="Catalogue" title="Browse Products" testId="browse" />
            <Link to="/products" data-testid="browse-view-all-link" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {products.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.06}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-slate-500" data-testid="browse-empty">Products are being added to the catalogue.</p>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24" data-testid="learn-visually-section">
        <div className="container-site">
          <SectionHeading eyebrow="Learn Visually" title="More Than Walls of Text" description="Every guide is packed with visual, reusable learning material." testId="learn-visually" />
        </div>
        <div className="mt-12 overflow-x-auto pb-4">
          <div className="container-site flex gap-4" data-testid="learn-visually-gallery">
            {LEARN_VISUALLY_ITEMS.map((item, i) => (
              <Reveal key={item} delay={i * 0.05}>
                <div className="flex w-44 shrink-0 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:w-52" data-testid={`learn-visual-${i}`}>
                  <span className="font-mono text-2xl font-bold text-slate-200">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-8 font-display text-base font-bold text-ink">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" data-testid="why-different-section">
        <div className="container-site">
          <SectionHeading eyebrow="Why These Guides Are Different" title="Built for Application, Not Just Reading" testId="why-different" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_DIFFERENT.map((item, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <Reveal key={item.title} delay={i * 0.06}>
                  <div className="card-lift h-full rounded-xl border border-slate-200 bg-[#FAFAFA] p-6" data-testid={`why-card-${i}`}>
                    <Icon className="h-5 w-5 text-brand-600" />
                    <h3 className="mt-4 font-display text-base font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="ink-section dot-grid-dark py-16 sm:py-24" data-testid="home-cta-section">
        <div className="container-site text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl" data-testid="home-cta-title">
              Build Better. Test Smarter. Understand What the Numbers Are Telling You.
            </h2>
            <Link to="/products" data-testid="home-cta-button" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700">
              Explore Digital Guides <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

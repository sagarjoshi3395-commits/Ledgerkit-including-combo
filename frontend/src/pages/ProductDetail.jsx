import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, ArrowRight, Truck, RotateCcw, Zap } from "lucide-react";
import { api, formatINR } from "../lib/api";
import Seo from "../components/Seo";
import { BookMockup } from "../components/BookMockup";
import { CheckoutButton } from "../components/CheckoutButton";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import FaqAccordion from "../components/FaqAccordion";
import Testimonials from "../components/Testimonials";
import { Skeleton } from "../components/ui/skeleton";

function ListBlock({ title, items, testId }) {
  if (!items?.length) return null;
  return (
    <div data-testid={testId}>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await api.get(`/products/${slug}`)).data,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="container-site space-y-6 py-24">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (isError || !product) {
    return (
      <div className="container-site py-24 text-center" data-testid="product-not-found">
        <h1 className="font-display text-3xl font-extrabold text-ink">Product not found</h1>
        <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">Back to all products <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  const digital = product.editions?.digital;
  const sale = digital?.price ?? product.sale_price;
  const regular = product.regular_price && sale && product.regular_price > sale ? product.regular_price : null;
  const dedicatedPages = { "meta-ads-decode": "/meta-ads-decode", "medical-reference-bundle": "/medical-reference-bundle", "business-bookkeeping-system": "/business-bookkeeping-system", "medical-6-pdf-combo": "/medical-6-combo" };
  const hasDedicatedPage = Boolean(dedicatedPages[product.slug]);
  const dedicatedPageUrl = dedicatedPages[product.slug];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.tagline || product.description,
    ...(sale != null && {
      offers: { "@type": "Offer", price: sale, priceCurrency: product.currency || "INR", availability: "https://schema.org/InStock" },
    }),
  };

  return (
    <main data-testid="product-detail-page">
      <Seo title={product.title} description={product.tagline} path={`/products/${product.slug}`} jsonLd={productJsonLd} />

      <section className="border-b border-slate-200 bg-white py-14 sm:py-20" data-testid="product-hero">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="dot-grid flex justify-center rounded-2xl border border-slate-200 bg-slate-50 py-14">
            <div className="animate-float-soft">
              <BookMockup size="lg" coverImage={product.cover_image} title={(product.short_title || product.title).toUpperCase()} subtitle={product.product_type} />
            </div>
          </Reveal>
          <div>
            <span className="eyebrow">{(product.category || "guide").replace(/-/g, " ")} • {product.product_type || "Guide"}</span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl" data-testid="product-title">{product.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{product.tagline}</p>
            <div className="mt-6 flex items-baseline gap-3" data-testid="product-price">
              {sale != null && <span className="font-display text-4xl font-extrabold text-ink">{formatINR(sale)}</span>}
              {regular && <span className="text-lg text-slate-400 line-through">{formatINR(regular)}</span>}
              {regular && sale != null && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Save {Math.round(((regular - sale) / regular) * 100)}%
                </span>
              )}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CheckoutButton product={product} edition="digital" testId="product-buy-button" className="bg-brand-600 px-7 py-4 text-sm text-white hover:bg-brand-700" />
              {hasDedicatedPage && (
                <Link to={dedicatedPageUrl} data-testid="product-dedicated-page-link" className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-surface px-7 py-4 text-sm font-semibold text-white hover:bg-ink">
                  View Full Details <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="mt-6 grid gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-brand-600" /> {product.delivery_method || "Instant digital access after successful payment"}</span>
              <span className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-brand-600" /> Refund rules: <Link to="/legal/refund-cancellation-policy" className="underline">Refund & Cancellation Policy</Link></span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <div data-testid="product-description">
              <h3 className="font-display text-xl font-bold text-ink">About This Product</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{product.description}</p>
            </div>
            <ListBlock title="What's Included" items={product.whats_included} testId="product-included" />
            <ListBlock title="Key Benefits" items={product.key_benefits} testId="product-benefits" />
            <ListBlock title="Bonuses" items={product.bonuses} testId="product-bonuses" />
          </div>
          <div>
            {product.who_for?.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6" data-testid="product-who-for">
                <h3 className="font-display text-lg font-bold text-ink">Who It's For</h3>
                <ul className="mt-4 space-y-3">
                  {product.who_for.map((w, i) => (
                    <li key={i} className="text-sm text-slate-600"><span className="font-semibold text-ink">{w.title}:</span> {w.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {product.faqs?.length > 0 && (
        <section className="bg-white py-14 sm:py-20">
          <div className="container-site max-w-3xl">
            <SectionHeading eyebrow="Questions" title="Product FAQ" testId="product-faq" />
            <div className="mt-8"><FaqAccordion items={product.faqs} testId="product-faq" /></div>
          </div>
        </section>
      )}

      <Testimonials productSlug={product.slug} title="What Buyers Say" />

      <section className="ink-section py-14 sm:py-20">
        <div className="container-site text-center">
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Ready to get started?</h2>
          <div className="mt-6 flex justify-center">
            <CheckoutButton product={product} edition="digital" testId="product-final-buy-button" className="bg-brand-600 px-8 py-4 text-sm text-white hover:bg-brand-700" />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Secure Checkout • Digital Product • Instant Access</p>
        </div>
      </section>
    </main>
  );
}

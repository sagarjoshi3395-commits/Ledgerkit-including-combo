import { useQuery } from "@tanstack/react-query";
import { api, formatINR } from "../../lib/api";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { CheckoutButton } from "../CheckoutButton";
import { Check } from "lucide-react";

const BUNDLE_SLUG = "complete-business-bundle";
const PART_SLUGS = ["meta-ads-decode", "ai-business-ideas-2026", "chatgpt-prompt-guide"];

export default function AddonOffers() {
  const { data: products = [] } = useQuery({
    queryKey: ["products", "addons"],
    queryFn: async () => (await api.get("/products")).data,
    staleTime: 60_000,
  });

  const bundle = products.find((p) => p.slug === BUNDLE_SLUG);
  if (!bundle) return null;

  const bundlePrice = bundle.editions?.digital?.price;
  const total = PART_SLUGS.reduce((sum, slug) => {
    const p = products.find((x) => x.slug === slug);
    return sum + (p?.editions?.digital?.price || 0);
  }, 0);
  const savings = bundlePrice != null && total > bundlePrice ? total - bundlePrice : null;

  return (
    <section className="bg-white py-16 sm:py-24" data-testid="addon-offers-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Best Value"
          title="Get the Complete Business Bundle"
          description="All three guides together — Digital Product Sales Engine, AI Business Ideas 2026 and ChatGPT Prompt Guide — for less than buying two separately."
          testId="addons"
        />
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div className="card-lift relative rounded-2xl border-2 border-brand-600 bg-white ring-4 ring-brand-600/10 sm:grid sm:grid-cols-2" data-testid="addon-card-bundle">
            <img
              src="/samples/bundle-covers.webp"
              alt="Digital Product Guide + ChatGPT Prompt Guide + AI Business Ideas Guide"
              loading="lazy"
              className="h-full w-full rounded-t-2xl object-cover sm:rounded-l-2xl sm:rounded-tr-none"
              data-testid="bundle-visual"
            />
            <div className="flex flex-col p-6 sm:p-8">
              <span className="w-fit rounded-full bg-brand-600 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                {bundle.editions?.digital?.badge || "Best Value"}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">{bundle.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{bundle.tagline}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {(bundle.whats_included || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-baseline gap-2" data-testid="bundle-price">
                <span className="font-display text-3xl font-extrabold text-ink">{formatINR(bundlePrice)}</span>
                {total > 0 && bundlePrice != null && total > bundlePrice && (
                  <span className="text-sm text-slate-400 line-through">{formatINR(total)}</span>
                )}
                {savings != null && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">You Save {formatINR(savings)}</span>
                )}
              </div>
              <CheckoutButton
                product={bundle}
                edition="digital"
                testId="addon-buy-bundle"
                className="mt-4 w-full bg-brand-600 px-5 py-3.5 text-sm text-white hover:bg-brand-700"
              >
                Get Complete Bundle
              </CheckoutButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

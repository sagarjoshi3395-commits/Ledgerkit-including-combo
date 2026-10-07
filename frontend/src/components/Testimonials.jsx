import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Quote } from "lucide-react";
import { api } from "../lib/api";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * Testimonials render ONLY when genuine entries exist in the database.
 * Empty state => section hidden entirely (no fabricated reviews).
 */
export default function Testimonials({ productSlug, dark = false, title = "What Readers Say", eyebrow = "Testimonials" }) {
  const { data } = useQuery({
    queryKey: ["testimonials", productSlug || "all"],
    queryFn: async () => (await api.get("/testimonials", { params: productSlug ? { product_slug: productSlug } : {} })).data,
    staleTime: 60_000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className={`py-16 sm:py-24 ${dark ? "ink-section" : ""}`} data-testid="testimonials-section">
      <div className="container-site">
        <SectionHeading eyebrow={eyebrow} title={title} dark={dark} testId="testimonials" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((t, i) => (
            <Reveal key={t.id || i} delay={i * 0.06}>
              <figure className={`flex h-full flex-col rounded-xl border p-6 ${dark ? "border-white/10 bg-ink-card" : "border-slate-200 bg-white"}`}>
                <Quote className={`h-5 w-5 ${dark ? "text-brand-400" : "text-brand-600"}`} />
                <blockquote className={`mt-4 flex-1 text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  “{t.review}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {t.profile_image ? (
                    <img src={t.profile_image} alt={t.customer_name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold ${dark ? "bg-white/10 text-white" : "bg-slate-100 text-ink"}`}>
                      {t.customer_name?.charAt(0) || "?"}
                    </span>
                  )}
                  <div>
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${dark ? "text-white" : "text-ink"}`}>
                      {t.customer_name}
                      {t.verified_purchase && <BadgeCheck className="h-4 w-4 text-blue-500" aria-label="Verified purchase" />}
                    </div>
                    {t.product_slug && <div className={`text-xs ${dark ? "text-slate-500" : "text-slate-500"}`}>Purchased: Digital Product Sales Engine</div>}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

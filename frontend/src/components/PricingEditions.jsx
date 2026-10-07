import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { api, formatINR } from "../lib/api";
import { trackEvent, getStoredUtms } from "../lib/analytics";
import { startRazorpayCheckout } from "../lib/razorpay";
import BuyerEmailDialog from "./BuyerEmailDialog";
import { useOfferTimer } from "../lib/offerTimer";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

const ADDON_DEFS = [
  { slug: "ai-business-ideas-2026", testId: "addon-tick-ai", sub: "Automation-ready AI business ideas that run on systems" },
  { slug: "chatgpt-prompt-guide", testId: "addon-tick-chatgpt", sub: "Product research, ebook creation, landing pages to ads" },
];
const BUNDLE_SLUG = "complete-business-bundle";

export default function PricingEditions({ product }) {
  const [ticks, setTicks] = useState({});
  const [offerOpen, setOfferOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null); // { items, value, title } -> email dialog
  const countdown = useOfferTimer(10);
  const timerText = countdown != null
    ? `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`
    : null;
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "bump-offers"],
    queryFn: async () => (await api.get("/products")).data,
    staleTime: 60_000,
  });

  const edition = product?.editions?.digital;
  if (!edition) return null;

  const regular = product?.regular_price;
  const savings = edition.price != null && regular != null && regular > edition.price ? regular - edition.price : null;
  const pct = savings != null ? Math.round((savings / regular) * 100) : null;

  const addons = ADDON_DEFS.map((d) => ({ ...d, product: allProducts.find((p) => p.slug === d.slug) })).filter((a) => a.product);
  const bundle = allProducts.find((p) => p.slug === BUNDLE_SLUG);
  const bundleEdition = bundle?.editions?.digital;
  const ticked = addons.filter((a) => ticks[a.slug]);
  const addonsTotal = ticked.reduce((s, a) => s + (a.product.editions?.digital?.price || 0), 0);
  const total = (edition.price || 0) + addonsTotal;
  const bundleSavings = bundleEdition?.price != null && total > bundleEdition.price ? total - bundleEdition.price : null;

  function checkout(items, value, title) {
    if (busy) return;
    setPending({ items, value, title });
  }

  async function handleEmailSubmit(email) {
    if (!pending || busy) return;
    const { items, value } = pending;
    setBusy(true);
    trackEvent("InitiateCheckout", { content_name: product.slug, value, currency: product.currency || "INR", ...getStoredUtms() });
    await startRazorpayCheckout({
      items,
      email,
      onError: (msg) => toast.error("Couldn't start checkout", { description: msg }),
      onDismiss: () => { setBusy(false); setPending(null); },
    });
    setBusy(false);
    setPending(null);
  }

  function handleMainCta() {
    if (busy) return;
    if (!ticked.length) {
      checkout([{ product_slug: product.slug, edition: "digital" }], edition.price, product.title);
      return;
    }
    setOfferOpen(true);
  }

  function handleContinueWithoutOffer() {
    setOfferOpen(false);
    const items = [
      { product_slug: product.slug, edition: "digital" },
      ...ticked.map((t) => ({ product_slug: t.slug, edition: "digital" })),
    ];
    checkout(items, total, product.title);
  }

  function handleGetBundle() {
    if (!bundle) {
      toast.info("Bundle is not available right now");
      return;
    }
    setOfferOpen(false);
    checkout([{ product_slug: BUNDLE_SLUG, edition: "digital" }], bundleEdition?.price, bundle?.title || "Complete Business Bundle");
  }

  return (
    <div className="mx-auto max-w-xl" data-testid="pricing-editions">
      <div className="card-lift relative flex flex-col rounded-2xl border border-brand-500 bg-white p-6 ring-2 ring-brand-500/30 sm:p-8" data-testid="edition-card-digital">
        <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          {edition.badge || "Instant Access"}
        </span>
        {pct != null && (
          <span className="absolute -top-3 right-6 rounded-full bg-ink-surface px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-400" data-testid="edition-discount-badge">
            {pct}% Off — Launch Offer
          </span>
        )}
        <h3 className="mt-1 font-display text-lg font-bold text-ink">{product?.title} — {edition.label}</h3>
        <div className="mt-4 flex flex-wrap items-baseline gap-3" data-testid="edition-price-digital">
          <span className="font-display text-5xl font-extrabold tracking-tight text-ink">{formatINR(edition.price)}</span>
          {regular > edition.price && <span className="text-xl text-slate-400 line-through">{formatINR(regular)}</span>}
          {savings != null && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">You Save {formatINR(savings)}</span>
          )}
        </div>
        <ul className="mt-6 space-y-2.5">
          {(edition.features || []).map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {addons.length > 0 && (
          <div className="mt-6 space-y-2.5 rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100" data-testid="bump-offers">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">Bump Offer — Tick to Add</p>
            {addons.map((a) => {
              const price = a.product.editions?.digital?.price;
              const active = Boolean(ticks[a.slug]);
              return (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => setTicks((t) => ({ ...t, [a.slug]: !t[a.slug] }))}
                  data-testid={a.testId}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors duration-200 ${
                    active ? "border-brand-600 bg-white ring-1 ring-brand-600/40" : "border-slate-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 ${active ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"}`}>
                    {active && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{a.product.title}</span>
                    {a.sub && <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{a.sub}</span>}
                  </span>
                  <span className="font-display text-sm font-extrabold text-brand-600">+{formatINR(price)}</span>
                </button>
              );
            })}
          </div>
        )}

        {timerText && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200" data-testid="pricing-card-timer">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand-700">Launch offer ends in {timerText}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleMainCta}
          disabled={busy}
          data-testid="buy-digital-button"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
        >
          {edition.cta || "Get Instant Access"} — <span data-testid="edition-total">{formatINR(total)}</span>
        </button>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-slate-400">
          {edition.note || "Secure Checkout • Digital Product • Instant Access"}
        </p>
      </div>

      {bundle && bundleEdition?.price != null && (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-4 sm:flex-row sm:p-5" data-testid="bundle-banner">
          <img src="/samples/bundle-covers.webp" alt="Complete Business Bundle — all three guides" loading="lazy" className="w-28 shrink-0 rounded-lg ring-1 ring-slate-200 sm:w-32" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display text-sm font-bold text-ink sm:text-base">Want all 3 guides? Get the Complete Business Bundle</p>
            <p className="mt-1 text-xs text-slate-500">
              Sales Engine + AI Ideas 2026 + Prompt Guide — {formatINR(bundleEdition.price)}
              {bundleSavings == null && total <= bundleEdition.price ? "" : " instead of ₹647"}
              <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Save ₹148</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleGetBundle}
            disabled={busy}
            data-testid="bundle-banner-buy"
            className="shrink-0 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
          >
            Get Bundle — {formatINR(bundleEdition.price)}
          </button>
        </div>
      )}

      <BuyerEmailDialog
        open={pending != null}
        onOpenChange={(v) => !v && setPending(null)}
        onSubmit={handleEmailSubmit}
        busy={busy}
        productTitle={pending?.title || product?.title || "your guide"}
        total={pending?.value ?? null}
      />

      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="max-w-md overflow-hidden p-0" data-testid="bundle-offer-modal">
          <img src="/samples/bundle-covers.webp" alt="All three LedgerKit guides" className="w-full" />
          <div className="p-6">
            <span className="eyebrow">Special Offer — Only Here</span>
            <DialogTitle className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
              Get Everything for {formatINR(bundleEdition?.price)}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">
              You're adding {ticked.map((t) => t.product.title).join(" + ")}. Take the Complete Business Bundle instead — all three guides for {formatINR(bundleEdition?.price)} instead of {formatINR(total)}.{bundleSavings ? ` You save ${formatINR(bundleSavings)}.` : ""}
            </DialogDescription>
            <button
              type="button"
              onClick={handleGetBundle}
              disabled={busy}
              data-testid="bundle-offer-accept"
              className="mt-5 w-full rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-[0_12px_30px_-8px_rgba(46,26,200,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-60"
            >
              Get the Bundle Offer — {formatINR(bundleEdition?.price)}
            </button>
            <button
              type="button"
              onClick={handleContinueWithoutOffer}
              disabled={busy}
              data-testid="bundle-offer-decline"
              className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Continue without the offer — {formatINR(total)}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

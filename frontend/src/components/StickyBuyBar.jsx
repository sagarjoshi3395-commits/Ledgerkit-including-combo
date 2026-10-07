import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, formatINR } from "../lib/api";
import { trackEvent, getStoredUtms } from "../lib/analytics";
import { startRazorpayCheckout } from "../lib/razorpay";
import BuyerEmailDialog from "./BuyerEmailDialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useOfferTimer } from "../lib/offerTimer";

const BUNDLE_SLUG = "complete-business-bundle";

/** Fixed bottom checkout bar with a one-tap Guide / Bundle switch. */
export default function StickyBuyBar({ product, offset = 600 }) {
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState("guide");
  const [busy, setBusy] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [pending, setPending] = useState(null); // { slug, price, title } -> email dialog
  const countdown = useOfferTimer(10);
  const timerText = countdown != null
    ? `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`
    : null;

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "sticky-bar"],
    queryFn: async () => (await api.get("/products")).data,
    staleTime: 60_000,
  });

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  const edition = product?.editions?.digital;
  const bundle = allProducts.find((p) => p.slug === BUNDLE_SLUG);
  const bundleEdition = bundle?.editions?.digital;
  const hasBundle = bundleEdition?.price != null;

  if (!edition) return null;
  const regular = product?.regular_price;

  const options = [
    { key: "guide", label: "Guide Only", price: edition.price, slug: product.slug, badge: null },
    ...(hasBundle
      ? [{ key: "bundle", label: "Bundle", price: bundleEdition.price, slug: BUNDLE_SLUG, badge: "Save More" }]
      : []),
  ];
  const active = options.find((o) => o.key === choice) || options[0];

  // Genuine bundle math: buying the 3 guides separately vs the bundle price.
  const partSlugs = ["meta-ads-decode", "ai-business-ideas-2026", "chatgpt-prompt-guide"];
  const separateTotal = partSlugs.reduce((sum, slug) => {
    const p = allProducts.find((x) => x.slug === slug);
    return sum + (p?.editions?.digital?.price || 0);
  }, 0);
  const bundleSavings = bundleEdition?.price != null && separateTotal > bundleEdition.price
    ? separateTotal - bundleEdition.price
    : null;

  const openEmail = (slug, price, title) => {
    setPending({ slug, price, title });
    setEmailOpen(true);
  };

  const handleClick = () => {
    if (busy) return;
    // Buying the guide alone? Show the bundle bump offer first (same as the pricing card).
    if (choice === "guide" && hasBundle) {
      setOfferOpen(true);
      return;
    }
    openEmail(active.slug, active.price, active.key === "bundle" ? (bundle?.title || "Complete Business Bundle") : product.title);
  };

  const handleTakeBundle = () => {
    setOfferOpen(false);
    openEmail(BUNDLE_SLUG, bundleEdition.price, bundle?.title || "Complete Business Bundle");
  };

  const handleKeepGuide = () => {
    setOfferOpen(false);
    openEmail(product.slug, edition.price, product.title);
  };

  const handleEmailSubmit = async (email) => {
    if (!pending) return;
    setBusy(true);
    trackEvent("InitiateCheckout", {
      content_name: pending.slug,
      value: pending.price || undefined,
      currency: product.currency || "INR",
      ...getStoredUtms(),
    });
    await startRazorpayCheckout({
      items: [{ product_slug: pending.slug, edition: "digital" }],
      email,
      onError: (msg) => toast.error("Couldn't start checkout", { description: msg }),
      onDismiss: () => { setBusy(false); setEmailOpen(false); setPending(null); },
    });
    setBusy(false);
    setEmailOpen(false);
    setPending(null);
  };

  return (
    <>
    <BuyerEmailDialog
      open={emailOpen}
      onOpenChange={(v) => { setEmailOpen(v); if (!v) setPending(null); }}
      onSubmit={handleEmailSubmit}
      busy={busy}
      productTitle={pending?.title || product.title}
      total={pending?.price ?? active.price}
    />
    <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
      <DialogContent className="max-w-md overflow-hidden p-0" data-testid="sticky-bundle-offer-modal">
        <img src="/samples/bundle-covers.webp" alt="All three LedgerKit guides" className="w-full" />
        <div className="p-6">
          <span className="eyebrow">Special Offer — Only Here</span>
          <DialogTitle className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
            Get Everything for {formatINR(bundleEdition?.price)}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">
            Before you check out — take the Complete Business Bundle instead: all three guides for {formatINR(bundleEdition?.price)} instead of {formatINR(separateTotal)}.{bundleSavings ? ` You save ${formatINR(bundleSavings)}.` : ""}
          </DialogDescription>
          <button
            type="button"
            onClick={handleTakeBundle}
            disabled={busy}
            data-testid="sticky-offer-accept"
            className="mt-5 w-full rounded-xl bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-[0_12px_30px_-8px_rgba(46,26,200,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-60"
          >
            Get the Bundle Offer — {formatINR(bundleEdition?.price)}
          </button>
          <button
            type="button"
            onClick={handleKeepGuide}
            disabled={busy}
            data-testid="sticky-offer-decline"
            className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Continue with the Guide only — {formatINR(edition.price)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      data-testid="sticky-buy-bar"
    >
      <div className="container-site flex items-center justify-between gap-3 py-2.5">
        <div className="flex min-w-0 flex-col gap-1">
          {options.length > 1 ? (
            <div className="flex gap-1.5" data-testid="sticky-offer-switch">
              {options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setChoice(o.key)}
                  data-testid={`sticky-option-${o.key}`}
                  className={`relative rounded-lg border px-3 py-1.5 text-left transition-colors duration-200 ${
                    choice === o.key ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600/40" : "border-slate-200 bg-white"
                  }`}
                >
                  {o.badge && (
                    <span className="absolute -top-2 right-1 rounded-full bg-brand-600 px-1.5 py-px font-mono text-[8px] font-bold uppercase tracking-wide text-white">
                      {o.badge}
                    </span>
                  )}
                  <span className={`block text-[10px] font-semibold ${choice === o.key ? "text-brand-700" : "text-slate-500"}`}>{o.label}</span>
                  <span className={`block font-display text-sm font-extrabold ${choice === o.key ? "text-ink" : "text-slate-400"}`}>{formatINR(o.price)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-slate-500">{product.title}</div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-base font-extrabold text-ink" data-testid="sticky-buy-price">{formatINR(edition.price)}</span>
                {regular > edition.price && <span className="text-xs text-slate-400 line-through">{formatINR(regular)}</span>}
              </div>
            </div>
          )}
          {timerText && (
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-brand-600" data-testid="sticky-buy-timer">
              Offer ends in {timerText}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          data-testid="sticky-buy-cta"
          className="shrink-0 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
        >
          Buy Now — {formatINR(active.price)}
        </button>
      </div>
    </div>
    </>
  );
}

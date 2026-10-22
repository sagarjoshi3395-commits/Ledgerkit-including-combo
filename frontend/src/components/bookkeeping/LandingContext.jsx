import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { trackEvent, getStoredUtms } from "../../lib/analytics";
import { startRazorpayCheckout } from "../../lib/razorpay";
import BuyerEmailDialog from "../BuyerEmailDialog";

export const BBS_TIMER_KEY = "lk_bbs_offer_deadline";
export const addOnPrice = (a) => a?.editions?.digital?.price ?? a?.sale_price ?? 0;

const BbsBuyCtx = createContext({
  product: null, openBuy: () => {}, price: 290, regularPrice: 999, highlight: false,
  addOns: [], selected: [], toggleAddOn: () => {}, total: 290,
});
export const useBbsBuy = () => useContext(BbsBuyCtx);

const FALLBACK = {
  slug: "business-bookkeeping-system",
  title: "Business Bookkeeping Sheet System",
  short_title: "Bookkeeping Sheet System",
  currency: "INR",
  price: 290,
  regular_price: 999,
};

const FALLBACK_ADDON = {
  slug: "productivity-execution-bundle",
  title: "Productivity & Execution Bundle",
  cover_image: "/assets/bookkeeping/productivity-bundle.webp",
  editions: { digital: { price: 149 } },
};

export function BbsBuyProvider({ children }) {
  const [product, setProduct] = useState(FALLBACK);
  const [addOns, setAddOns] = useState([FALLBACK_ADDON]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [pricingSeen, setPricingSeen] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    api.get("/products/business-bookkeeping-system").then(({ data }) => {
      const edition = data?.editions?.digital || {};
      setProduct((p) => ({
        ...p,
        ...data,
        price: edition.price ?? data.sale_price ?? p.price,
        regular_price: edition.regular_price ?? data.regular_price ?? p.regular_price,
      }));
    }).catch(() => {});
    api.get("/bookkeeping/add-ons").then(({ data }) => {
      if (Array.isArray(data) && data.length) setAddOns(data);
    }).catch(() => {});
  }, []);

  const toggleAddOn = useCallback((slug) => {
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  }, []);

  const total = useMemo(
    () => product.price + addOns.filter((a) => selected.includes(a.slug)).reduce((s, a) => s + addOnPrice(a), 0),
    [product.price, addOns, selected],
  );

  const scrollToPricing = () => {
    document.getElementById("bbs-pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(true);
    window.setTimeout(() => setHighlight(false), 2200);
  };

  // Hero CTA: first click shows pricing (with the add-on); every other CTA —
  // and the second hero click — opens checkout straight away.
  const openBuy = useCallback((straightToCheckout) => {
    if (loading) return;
    if (straightToCheckout === true || pricingSeen) {
      setEmailOpen(true);
      return;
    }
    setPricingSeen(true);
    scrollToPricing();
  }, [loading, pricingSeen]);

  async function handleEmailSubmit(email) {
    setLoading(true);
    trackEvent("InitiateCheckout", {
      content_name: product.slug,
      content_ids: [product.slug, ...selected],
      num_items: 1 + selected.length,
      value: total,
      currency: product.currency || "INR",
      ...getStoredUtms(),
    });
    const opened = await startRazorpayCheckout({
      items: [{ product_slug: product.slug, edition: "digital" }, ...selected.map((s) => ({ product_slug: s, edition: "digital" }))],
      email,
      onError: (msg) => {
        setLoading(false);
        toast.error("Couldn't start checkout", { description: msg, duration: 8000 });
      },
      onDismiss: () => setLoading(false),
    });
    // Close our dialog once Razorpay is on screen so the two never overlap.
    if (opened) setEmailOpen(false);
    else setLoading(false);
  }

  return (
    <BbsBuyCtx.Provider value={{ product, openBuy, price: product.price, regularPrice: product.regular_price, highlight, addOns, selected, toggleAddOn, total }}>
      {children}
      <BuyerEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSubmit={handleEmailSubmit}
        busy={loading}
        productTitle={product.short_title || product.title}
        total={total}
        addOns={addOns}
        selectedAddOns={selected}
        onToggleAddOn={toggleAddOn}
        addOnPrice={addOnPrice}
      />
    </BbsBuyCtx.Provider>
  );
}

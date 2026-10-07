import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { trackEvent, getStoredUtms } from "../../lib/analytics";
import { startRazorpayCheckout } from "../../lib/razorpay";
import BuyerEmailDialog from "../BuyerEmailDialog";

const BbsBuyCtx = createContext({
  product: null, openBuy: () => {}, price: 290, regularPrice: 999, highlight: false,
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

export function BbsBuyProvider({ children }) {
  const [product, setProduct] = useState(FALLBACK);
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
  }, []);

  const scrollToPricing = () => {
    document.getElementById("bbs-pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(true);
    window.setTimeout(() => setHighlight(false), 2200);
  };

  // Page CTAs: first click shows the pricing section; the next click opens
  // checkout. The pricing button passes `true` and always goes straight there.
  const openBuy = (straightToCheckout) => {
    if (loading) return;
    if (straightToCheckout === true || pricingSeen) {
      setEmailOpen(true);
      return;
    }
    setPricingSeen(true);
    scrollToPricing();
  };

  async function handleEmailSubmit(email) {
    setLoading(true);
    trackEvent("InitiateCheckout", {
      content_name: product.slug,
      value: product.price,
      currency: product.currency || "INR",
      ...getStoredUtms(),
    });
    await startRazorpayCheckout({
      items: [{ product_slug: product.slug }],
      email,
      onError: (msg) => toast.error("Couldn't start checkout", { description: msg }),
      onDismiss: () => {
        setLoading(false);
        setEmailOpen(false);
      },
      onSuccess: ({ order_id }) => {
        window.location.href = `/order-success?order_id=${order_id}`;
      },
    });
    setLoading(false);
    setEmailOpen(false);
  }

  return (
    <BbsBuyCtx.Provider value={{ product, openBuy, price: product.price, regularPrice: product.regular_price, highlight }}>
      {children}
      <BuyerEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSubmit={handleEmailSubmit}
        busy={loading}
        productTitle={product.short_title || product.title}
        total={product.price}
      />
    </BbsBuyCtx.Provider>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { trackEvent, getStoredUtms } from "../lib/analytics";
import { startRazorpayCheckout } from "../lib/razorpay";
import BuyerEmailDialog from "./BuyerEmailDialog";

/**
 * Purchase button. Asks for the buyer's email, opens the Razorpay checkout,
 * verifies the payment server-side (which also emails the product), then
 * routes to /order-success.
 */
export function CheckoutButton({ product, edition = "digital", className = "", children, testId }) {
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const editionData = product?.editions?.[edition];
  const price = editionData?.price;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setEmailOpen(true);
  }

  async function handleEmailSubmit(email) {
    setLoading(true);
    trackEvent("InitiateCheckout", {
      content_name: product?.slug,
      content_category: edition,
      value: price || undefined,
      currency: product?.currency || "INR",
      ...getStoredUtms(),
    });
    await startRazorpayCheckout({
      items: [{ product_slug: product.slug, edition }],
      email,
      onError: (msg) => toast.error("Couldn't start checkout", { description: msg }),
      onDismiss: () => { setLoading(false); setEmailOpen(false); },
      onSuccess: ({ order_id }) => {
        window.location.href = `/order-success?order_id=${order_id}`;
      },
    });
    setLoading(false);
    setEmailOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        data-testid={testId || `buy-${edition}-button`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-60 ${className}`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children || editionData?.cta || "Get Instant Access"}
        {price != null && <span className="opacity-80">— ₹{Number(price).toLocaleString("en-IN")}</span>}
      </button>
      <BuyerEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSubmit={handleEmailSubmit}
        busy={loading}
        productTitle={product?.title || "your guide"}
        total={price}
      />
    </>
  );
}

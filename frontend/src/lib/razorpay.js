import { api } from "./api";
import { getStoredUtms } from "./analytics";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;

/** Lazy-load the Razorpay Checkout script once. */
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Start a Razorpay checkout for one or more items.
 *
 * @param {Object} opts
 * @param {Array<{product_slug:string, edition?:string}>} opts.items - items to purchase
 * @param {string} [opts.email] - optional prefill email
 * @param {Object} [opts.prefill] - optional { name, email, contact }
 * @param {Function} [opts.onSuccess] - called with { order_id } after verification
 * @param {Function} [opts.onError] - called with an error message string
 * @param {Function} [opts.onDismiss] - called when the user closes the modal
 * @returns {Promise<boolean>} true if the modal opened
 */
export async function startRazorpayCheckout({ items, email, prefill = {}, onSuccess, onError, onDismiss }) {
  // Load the checkout script and create the server-side order concurrently.
  const createOrder = async () => {
    try {
      const res = await api.post("/checkout/create-order", { items, email, ...getStoredUtms() });
      return res.data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      onError?.(typeof detail === "string" ? detail : "Couldn't start checkout. Please try again.");
      return null;
    }
  };

  const [scriptOk, order] = await Promise.all([loadRazorpayScript(), createOrder()]);
  if (!order) return false;
  if (!scriptOk || !window.Razorpay) {
    onError?.("Could not load the payment window. Please check your connection and try again.");
    return false;
  }

  const options = {
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    name: order.name || "LedgerKit",
    description: order.description,
    order_id: order.razorpay_order_id,
    prefill: { email: email || prefill.email || "", ...prefill },
    theme: { color: "#2E1AC8" },
    handler: async (response) => {
      try {
        await api.post("/checkout/verify", {
          order_id: order.order_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        if (onSuccess) onSuccess({ order_id: order.order_id });
        else window.location.href = `/order-success?order_id=${order.order_id}`;
      } catch (err) {
        onError?.("Payment received but verification failed. Please contact support with your payment ID.");
      }
    },
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (resp) => {
    onError?.(resp?.error?.description || "Payment failed. Please try again.");
  });
  // Radix dialogs set pointer-events:none on <body> while open; clear any leftover
  // so the Razorpay iframe stays clickable even if a dialog close is mid-animation.
  document.body.style.pointerEvents = "";
  document.body.style.removeProperty("pointer-events");
  rzp.open();
  return true;
}

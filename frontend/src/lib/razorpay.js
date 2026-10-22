import { api } from "./api";
import { getStoredUtms } from "./analytics";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;

const OVERLAY_ID = "rzp-confirming-overlay";

function showConfirmingOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  const el = document.createElement("div");
  el.id = OVERLAY_ID;
  el.setAttribute("data-testid", "payment-confirming-overlay");
  el.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(11,20,55,.78);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif";
  el.innerHTML = '<div style="background:#fff;border-radius:16px;padding:28px 32px;text-align:center;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,.3)"><div style="width:40px;height:40px;margin:0 auto 14px;border:4px solid #e2e8f0;border-top-color:#2E1AC8;border-radius:50%;animation:rzpspin .8s linear infinite"></div><div style="font-weight:700;color:#0B1437;font-size:17px">Payment successful</div><div style="color:#64748b;font-size:14px;margin-top:6px">Opening your downloads…</div></div><style>@keyframes rzpspin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(el);
}

function hideConfirmingOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
}

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
    let lastErr = null;
    // Retry server/network hiccups (5xx, timeouts) so a brief blip never blocks a buyer.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const res = await api.post("/checkout/create-order", { items, email, ...getStoredUtms() }, { timeout: 20000 });
        if (res?.data?.razorpay_order_id) return res.data;
        lastErr = null;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        if (status && status < 500) break; // real validation error — don't retry
      }
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
    const status = lastErr?.response?.status;
    const detail = lastErr?.response?.data?.detail;
    if (status && status < 500 && typeof detail === "string") onError?.(detail);
    else onError?.("Our payment server is busy right now. Please try again in a moment.");
    return null;
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
      showConfirmingOverlay();
      const body = {
        order_id: order.order_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      };
      // Retry a few times so a brief network blip never leaves the buyer stuck.
      let verified = false;
      for (let attempt = 0; attempt < 3 && !verified; attempt += 1) {
        try {
          await api.post("/checkout/verify", body, { timeout: 15000 });
          verified = true;
        } catch (err) {
          const status = err?.response?.status;
          if (status === 400 || status === 404) break;
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
        }
      }
      if (verified) {
        if (onSuccess) {
          hideConfirmingOverlay();
          onSuccess({ order_id: order.order_id });
        } else window.location.href = `/order-success?order_id=${order.order_id}`;
      } else {
        hideConfirmingOverlay();
        onError?.(`Payment received but verification failed. Please contact support with payment ID ${response.razorpay_payment_id}.`);
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
  rzp.open();
  return true;
}

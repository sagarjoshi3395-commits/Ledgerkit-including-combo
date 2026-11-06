import { useEffect } from "react";

// Page-scoped Meta Pixel loader.
// Each landing page passes its OWN pixel ID — we do not initialise any pixel
// globally in index.html, so there is no cross-page attribution.

const INIT_PIXELS = typeof window !== "undefined" ? new Set() : new Set();

function ensureFbqLoaded() {
  if (typeof window === "undefined") return;
  if (window.fbq) return;
  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
}

export function initMetaPixel(pixelId, { trackPageView = true } = {}) {
  if (typeof window === "undefined" || !pixelId) return;
  ensureFbqLoaded();
  if (!INIT_PIXELS.has(pixelId)) {
    window.fbq("init", pixelId);
    INIT_PIXELS.add(pixelId);
  }
  if (trackPageView) window.fbq("track", "PageView");
}

// Page-pixel hook. Call from a page's root once with its own pixel ID or an array of IDs.
export function useMetaPixel(pixelIdOrIds) {
  const key = Array.isArray(pixelIdOrIds) ? pixelIdOrIds.join(",") : pixelIdOrIds || "";
  useEffect(() => {
    const ids = Array.isArray(pixelIdOrIds) ? pixelIdOrIds : [pixelIdOrIds];
    ids.filter(Boolean).forEach((id) => initMetaPixel(id));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Map a product_slug to the pixel(s) that own its page (used on Order Success).
export function pixelIdsForProductSlug(slug) {
  if (!slug) return [];
  if (slug === "business-bookkeeping-system" || slug === "productivity-execution-bundle") {
    return ["1605079064338578", "2251324629120904"];
  }
  if (
    slug === "medical-6-pdf-combo" ||
    slug === "ct-mri-xray-guide" ||
    slug === "radiology-guide"
  ) {
    return ["3470309736541129"];
  }
  return [];
}

// Legacy single-id helper (kept for callers that only want one pixel).
export function pixelIdForProductSlug(slug) {
  const arr = pixelIdsForProductSlug(slug);
  return arr[0] || null;
}

const STANDARD = new Set(["PageView", "ViewContent", "InitiateCheckout", "Purchase", "Lead", "AddToCart"]);

export function trackEvent(name, params = {}) {
  try {
    if (typeof window === "undefined") return;
    if (window.fbq) {
      if (STANDARD.has(name)) window.fbq("track", name, params);
      else window.fbq("trackCustom", name, params);
    }
    if (window.gtag) window.gtag("event", name, params);
  } catch (e) {
    // analytics must never break the app
  }
}

export function trackPageView(path) {
  trackEvent("PageView", { page_path: path });
}

export function getStoredUtms() {
  try {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    const found = {};
    keys.forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v;
    });
    if (Object.keys(found).length) sessionStorage.setItem("utms", JSON.stringify(found));
    return JSON.parse(sessionStorage.getItem("utms") || "{}");
  } catch (e) {
    return {};
  }
}

export function appendUtms(url) {
  try {
    const utms = getStoredUtms();
    if (!Object.keys(utms).length) return url;
    const target = new URL(url, window.location.origin);
    Object.entries(utms).forEach(([k, v]) => target.searchParams.set(k, v));
    return target.toString();
  } catch (e) {
    return url;
  }
}

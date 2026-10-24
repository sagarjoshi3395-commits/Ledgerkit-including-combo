import { useEffect, useState } from "react";

const KEY = "lk_offer_deadline";

/**
 * Per-visitor launch-offer timer. The deadline is set once on first visit and
 * never resets; when it expires the timer hides and the price stays the same.
 * Returns seconds remaining, or null when expired/unavailable.
 */
export function useOfferTimer(minutes = 10, storageKey = KEY, loop = false) {
  const [deadline, setDeadline] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(storageKey));
      if (stored && stored > Date.now()) {
        setDeadline(stored);
      } else if (!stored || loop) {
        const d = Date.now() + minutes * 60_000;
        localStorage.setItem(storageKey, String(d));
        setDeadline(d);
      }
    } catch (e) {
      // storage unavailable — no timer
    }
  }, [minutes, storageKey, loop]);

  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => {
      const n = Date.now();
      if (loop && n >= deadline) {
        const d = n + minutes * 60_000;
        try { localStorage.setItem(storageKey, String(d)); } catch (e) { /* ignore */ }
        setDeadline(d);
      }
      setNow(n);
    }, 1000);
    return () => clearInterval(t);
  }, [deadline, loop, minutes, storageKey]);

  if (!deadline) return null;
  const remaining = Math.floor((deadline - now) / 1000);
  return remaining > 0 ? remaining : null;
}

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BadgeCheck, X } from "lucide-react";
import { api } from "../lib/api";
import { PURCHASE_PINGS } from "../lib/siteContent";

/**
 * Social-proof purchase popup. Cities/timing are configured in lib/siteContent.js (PURCHASE_PINGS).
 * When genuine paid orders exist in the backend, it automatically switches to verified mode.
 * Set PURCHASE_PINGS.enabled = false to disable completely.
 */
export default function PurchaseNotifications({ productTitle = "Sales Engine" }) {
  const { data } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => (await api.get("/orders/recent-summary")).data,
    staleTime: 300_000,
  });
  const [ping, setPing] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    if (data === undefined || !PURCHASE_PINGS.enabled) return;
    const genuine = (data?.paid_orders_last_7_days || 0) > 0;
    const delay = () =>
      (PURCHASE_PINGS.minDelaySec + Math.random() * (PURCHASE_PINGS.maxDelaySec - PURCHASE_PINGS.minDelaySec)) * 1000;

    const show = () => {
      if (genuine) {
        setPing({ text: `Someone purchased ${productTitle} recently`, sub: "Verified order this week", verified: true });
      } else {
        const city = PURCHASE_PINGS.cities[Math.floor(Math.random() * PURCHASE_PINGS.cities.length)];
        const mins = [2, 4, 5, 8, 11, 14][Math.floor(Math.random() * 6)];
        setPing({ text: `A reader from ${city} grabbed ${productTitle}`, sub: `${mins} min ago`, verified: false });
      }
      timers.current.push(setTimeout(() => setPing(null), 6000));
      timers.current.push(setTimeout(show, delay()));
    };
    timers.current.push(setTimeout(show, 9000));
    const stash = timers.current;
    return () => stash.forEach(clearTimeout);
  }, [data, productTitle]);

  if (!ping) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -90 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="fixed bottom-24 left-3 z-40 flex max-w-[320px] items-center gap-3 rounded-2xl bg-ink-surface p-3 pr-9 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 sm:left-5"
      data-testid="purchase-ping"
    >
      <img src="/samples/cover.webp" alt="" className="h-14 w-10 shrink-0 rounded-lg object-cover ring-1 ring-white/15" />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug text-white">{ping.text}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {ping.sub}
          {ping.verified && <BadgeCheck className="h-3 w-3 text-blue-400" />}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setPing(null)}
        className="absolute right-2 top-2 text-slate-500 transition-colors hover:text-white"
        data-testid="purchase-ping-dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

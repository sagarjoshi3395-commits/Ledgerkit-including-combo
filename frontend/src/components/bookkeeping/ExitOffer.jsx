import { useEffect, useRef, useState } from "react";
import { Check, Gift, Timer, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { useOfferTimer } from "../../lib/offerTimer";
import { trackEvent } from "../../lib/analytics";
import { useBbsBuy, addOnPrice, BBS_TIMER_KEY } from "./LandingContext";

const SHOWN_KEY = "lk_bbs_exit_shown";
const ITEMS = [
  "📊 Lead Tracker Template (Sheets & Excel)",
  "💰 Word, PowerPoint & Power BI Templates + Habit Tracker",
  "🤖 3,200+ AI & ChatGPT Prompts for Business",
  "✉️ 1,000+ Ready-to-Use Email Templates",
  "🎥 1,600+ Business & Reel Ideas",
];

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const MiniTimer = () => {
  const remaining = useOfferTimer(10, BBS_TIMER_KEY);
  return <span data-testid="bbs-exit-timer">{remaining != null ? `Launch price ends in ${fmt(remaining)}` : "Launch price — ending soon"}</span>;
};

/**
 * Last-chance offer for the bookkeeping page. Shows once per session when a visitor
 * moves the mouse out of the top of the window (desktop) or presses Back (phones).
 * No fake discounts — it simply offers the sheet + add-on at the normal prices.
 */
export default function ExitOffer() {
  const { openBuy, price, addOns, addAddOn, checkoutActive, closeCheckout } = useBbsBuy();
  const [open, setOpen] = useState(false);
  const activeRef = useRef(checkoutActive);
  activeRef.current = checkoutActive;
  const closeRef = useRef(closeCheckout);
  closeRef.current = closeCheckout;
  const addOn = addOns[0];
  const addOnCost = addOn ? addOnPrice(addOn) : 149;

  useEffect(() => {
    const alreadyShown = () => {
      try { return sessionStorage.getItem(SHOWN_KEY) === "1"; } catch (e) { return false; }
    };

    const trigger = () => {
      if (alreadyShown() || activeRef.current) return false;
      try { sessionStorage.setItem(SHOWN_KEY, "1"); } catch (e) { /* ignore */ }
      setOpen(true);
      trackEvent("ExitOfferShown", { content_name: "business-bookkeeping-system" });
      return true;
    };

    // Desktop: mouse leaves through the top of the window (towards tabs / close).
    const onMouseOut = (e) => {
      if (e.relatedTarget || e.clientY > 8) return;
      trigger();
    };

    // Phones (and desktop Back): add one extra history entry, catch the first Back press.
    // If we're already standing on our extra entry (reload, or Back from another page),
    // reuse it instead of adding another one — keeps history clean and idempotent.
    let trapped = !!window.history.state?.bbsTrap;
    const arm = () => {
      try {
        window.history.pushState({ ...(window.history.state || {}), bbsTrap: true }, "", window.location.href);
        trapped = true;
      } catch (e) { /* ignore */ }
    };
    const timer = window.setTimeout(() => {
      if (!trapped && !window.history.state?.bbsTrap) arm();
      else trapped = true;
    }, 1500);
    const onPop = (e) => {
      if (!trapped || e.state?.bbsTrap) return;
      trapped = false;
      // Back while checkout is open: just close the checkout and stay on the page.
      if (activeRef.current) {
        closeRef.current?.();
        arm();
        return;
      }
      if (!trigger()) window.history.back();
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("popstate", onPop);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const takeBundle = () => {
    if (addOn) addAddOn(addOn.slug);
    trackEvent("ExitOfferAccepted", { content_name: "bundle" });
    setOpen(false);
    window.setTimeout(() => openBuy(true), 150);
  };
  const takeSheet = () => {
    setOpen(false);
    window.setTimeout(() => openBuy(true), 150);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] max-w-md overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white p-0 max-sm:!top-3 max-sm:!translate-y-0 max-sm:!animate-none [&>button:last-child]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-testid="bbs-exit-offer"
      >
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" data-testid="bbs-exit-close" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-900">
          <X className="h-4 w-4" />
        </button>
        <div className="bg-ink px-6 pb-5 pt-6 text-white">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-volt px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-900">
            <Gift className="h-3 w-3" /> Wait — before you go
          </p>
          <DialogTitle className="mt-3 font-display text-2xl font-extrabold leading-tight text-white">
            Get the full business kit for ₹{price + addOnCost}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-[14px] text-neutral-300">
            Bookkeeping Sheet System (₹{price}) + Productivity &amp; Execution Bundle (₹{addOnCost}) — track your money <b className="text-volt">and</b> grow your business.
          </DialogDescription>
        </div>
        <div className="px-6 pb-6 pt-4">
          <ul className="space-y-1.5">
            {ITEMS.map((t) => (
              <li key={t} className="text-[13.5px] font-medium text-neutral-800">{t}</li>
            ))}
            <li className="flex items-center gap-1.5 text-[13.5px] font-bold text-neutral-900"><Check className="h-4 w-4" /> + 10-dashboard Bookkeeping Sheet (Excel & Sheets)</li>
          </ul>
          <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-red-600">
            <Timer className="h-3.5 w-3.5" /> <MiniTimer />
          </p>
          <button type="button" onClick={takeBundle} data-testid="bbs-exit-take-bundle" className="bbs-btn mt-3 w-full text-[15px]">
            Yes, give me both · ₹{price + addOnCost}
          </button>
          <button type="button" onClick={takeSheet} data-testid="bbs-exit-take-sheet" className="mt-2.5 w-full rounded-lg py-2 text-[13px] font-semibold text-neutral-600 underline-offset-2 hover:underline">
            Just the sheet for ₹{price}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

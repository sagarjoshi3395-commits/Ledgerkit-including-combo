import { useOfferTimer } from "../lib/offerTimer";

/** 10-minute per-visitor launch timer. Price does not change after expiry — the timer simply hides. */
export default function CountdownTimer({ minutes = 10, dark = false }) {
  const remaining = useOfferTimer(minutes);
  if (remaining === null) return null;

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const cell = `flex min-w-[76px] flex-col items-center rounded-lg px-3 py-2 ${
    dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-slate-200"
  }`;

  return (
    <div className="flex flex-col items-center gap-2" data-testid="offer-countdown">
      <span className={`font-mono text-[11px] font-semibold uppercase tracking-[0.2em] ${dark ? "text-brand-400" : "text-brand-600"}`}>
        Launch Offer Ends In
      </span>
      <div className="flex items-center gap-2">
        {[[m, "Minutes"], [s, "Seconds"]].map(([v, label]) => (
          <div key={label} className={cell}>
            <span className={`font-display text-2xl font-extrabold tabular-nums ${dark ? "text-white" : "text-ink"}`}>
              {String(v).padStart(2, "0")}
            </span>
            <span className={`font-mono text-[9px] uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

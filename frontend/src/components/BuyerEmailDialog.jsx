import { useEffect, useState } from "react";
import { Mail, ArrowRight, Loader2, ShieldCheck, Check, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

const EMAIL_KEY = "lk_buyer_email";

const fmtINR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export function getSavedBuyerEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function saveBuyerEmail(email) {
  try {
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    /* storage unavailable */
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Asks the buyer for their email before opening Razorpay.
 * The same email is pre-filled in Razorpay, stored on the order, and is where
 * the product delivery email is sent after payment.
 */
export default function BuyerEmailDialog({ open, onOpenChange, onSubmit, busy = false, productTitle = "your guide", total = null, addOns = [], selectedAddOns = [], onToggleAddOn, addOnPrice }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const priceOf = addOnPrice || ((a) => a?.editions?.digital?.price ?? a?.sale_price ?? 0);

  useEffect(() => {
    if (open) {
      setEmail(getSavedBuyerEmail());
      setError("");
    }
  }, [open]);

  function submit(e) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError("Please enter a valid email address");
      return;
    }
    saveBuyerEmail(value);
    onSubmit(value);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-sm overflow-y-auto p-5 sm:p-6" data-testid="buyer-email-dialog">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 sm:h-11 sm:w-11">
          <Mail className="h-5 w-5 text-brand-700" />
        </span>
        <DialogTitle className="mt-3 font-display text-lg font-extrabold tracking-tight text-ink sm:mt-4 sm:text-xl">
          Where should we send {productTitle === "your guide" ? "your guide" : "it"}?
        </DialogTitle>
        <DialogDescription className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Enter your email — your download link for <span className="font-semibold text-ink">{productTitle}</span> is delivered here instantly after payment.
        </DialogDescription>
        <form onSubmit={submit} className="mt-4 sm:mt-5">
          <label htmlFor="buyer-email" className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Email address
          </label>
          <input
            id="buyer-email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            data-testid="buyer-email-input"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
          {error && <p className="mt-1.5 text-xs font-medium text-red-600" data-testid="buyer-email-error">{error}</p>}

          {addOns.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3" data-testid="buyer-dialog-addons">
              <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <Plus className="h-3 w-3" /> Add these too — only with this order
              </p>
              <div className="mt-2.5 space-y-2">
                {addOns.map((a) => {
                  const on = selectedAddOns.includes(a.slug);
                  return (
                    <button
                      key={a.slug}
                      type="button"
                      onClick={() => onToggleAddOn?.(a.slug)}
                      aria-pressed={on}
                      data-testid={`buyer-dialog-addon-${a.slug}`}
                      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 ${on ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"}`}>
                        {on && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className="flex-1 text-xs font-semibold leading-tight text-ink sm:text-sm">{a.title}</span>
                      <span className="text-xs font-bold text-brand-700 sm:text-sm">+ {fmtINR(priceOf(a))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="buyer-email-continue"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to Payment{total != null ? ` — ${fmtINR(total)}` : ""} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure payment • Instant delivery to this email
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

const EMAIL_KEY = "lk_buyer_email";

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
export default function BuyerEmailDialog({ open, onOpenChange, onSubmit, busy = false, productTitle = "your guide", total = null }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
      <DialogContent className="max-w-sm p-6" data-testid="buyer-email-dialog">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100">
          <Mail className="h-5 w-5 text-brand-700" />
        </span>
        <DialogTitle className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink">
          Where should we send {productTitle === "your guide" ? "your guide" : "it"}?
        </DialogTitle>
        <DialogDescription className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Enter your email — your download link for <span className="font-semibold text-ink">{productTitle}</span> is delivered here instantly after payment.
        </DialogDescription>
        <form onSubmit={submit} className="mt-5">
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
          <button
            type="submit"
            disabled={busy}
            data-testid="buyer-email-continue"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to Payment{total != null ? ` — ₹${Number(total).toLocaleString("en-IN")}` : ""} <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure payment • Instant delivery to this email
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

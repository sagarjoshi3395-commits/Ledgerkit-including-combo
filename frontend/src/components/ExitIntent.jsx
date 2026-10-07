import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { BookOpen } from "lucide-react";

/** Gentle desktop exit-intent: offers a preview, never fake discounts. Shows once per session. */
export default function ExitIntent({ onPreview }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const handler = (e) => {
      if (e.clientY > 0) return;
      if (sessionStorage.getItem("exit_intent_shown")) return;
      sessionStorage.setItem("exit_intent_shown", "1");
      setOpen(true);
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" data-testid="exit-intent-modal">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100">
          <BookOpen className="h-5 w-5 text-brand-600" />
        </div>
        <DialogTitle className="font-display text-xl font-bold text-ink">Want to Preview It First?</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-slate-600">
          Browse real sample pages, the full curriculum and the bonus toolkit before you decide. No pressure — the guide speaks for itself.
        </DialogDescription>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onPreview?.();
          }}
          data-testid="exit-intent-preview-button"
          className="mt-2 w-full rounded-lg bg-ink-surface px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink"
        >
          See Sample Pages
        </button>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, Download, Zap, BookOpen, Stethoscope, ArrowRight, Loader2, Mail } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { startRazorpayCheckout } from "@/lib/razorpay";
import BuyerEmailDialog from "@/components/BuyerEmailDialog";
import FaqAccordion from "@/components/FaqAccordion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COMBO_SLUG = "medical-6-pdf-combo";
const FALLBACK_PRICE = 297;

const GUIDES = [
  { key: "disease", title: "Disease Reference Guide", cover: "/samples/combo-6/cover-disease.png", desc: "120+ common diseases: causes, symptoms, diagnosis, treatment overview.", points: ["120+ common diseases", "Causes & symptoms", "Diagnosis & treatment overview"] },
  { key: "medicine", title: "Medicine Reference Guide", cover: "/samples/med-medicine-cover.webp", desc: "Common medicines: drug class, uses, side effects, key points.", points: ["Drug class & uses", "Side effects", "Key points at a glance"] },
  { key: "lab", title: "Lab Report Decode", pages: "86 pages", cover: "/samples/combo-6/cover-lab-report.svg", desc: "CBC, liver, kidney, thyroid, ABG and report patterns.", points: ["CBC, LFT, KFT, thyroid", "ABG interpretation", "Common report patterns"] },
  { key: "emergency", title: "Emergency Medical Guide", pages: "73 pages", cover: "/samples/combo-6/cover-emergency.png", desc: "ABCDE, CPR, shock, triage, drug quick reference.", points: ["ABCDE & CPR", "Shock & triage", "Emergency drug quick reference"] },
  { key: "ecg", title: "ECG Reading Guide", pages: "59 pages", cover: "/samples/combo-6/cover-ecg.png", desc: "ECG basics, rhythms, AV blocks, step-by-step approach.", points: ["ECG basics", "Rhythms & AV blocks", "Step-by-step approach"] },
  { key: "ayurvedic", title: "Ayurvedic Medicine Guide", pages: "78 pages", cover: "/samples/combo-6/cover-ayurvedic.png", desc: "Common Ayurvedic medicines and uses, English + Hindi.", points: ["Common Ayurvedic medicines", "Uses & dosage guidance", "English + Hindi"] },
];

const AUDIENCE = ["MBBS", "BAMS", "BHMS", "Nursing", "B.Pharm / D.Pharm", "Paramedical", "Interns"];

const DIFFERENCE = [
  { icon: BookOpen, title: "Visual, not textbook-heavy", text: "Diagrams, structured tables and clean layouts — built to scan in seconds, not slog through chapters." },
  { icon: Zap, title: "Made for quick revision", text: "Quick-reference formatting means you revise a topic in minutes before a class, round or exam." },
  { icon: Download, title: "Always on your phone", text: "Instant PDFs that live on your mobile, tablet or laptop — no carrying books, no waiting for delivery." },
];

const STEPS = [
  { title: "Choose your pack", text: "The 6 PDF combo — plus any add-ons you want to tick." },
  { title: "Pay securely", text: "UPI, cards or netbanking through Razorpay's secure checkout." },
  { title: "Download instantly", text: "PDFs open on your success page and are delivered to your email." },
];

const FAQS = [
  { q: "Is this a printed book?", a: "No — these are instant PDF guides you can read on mobile, tablet and laptop. Nothing is shipped." },
  { q: "How will I get the PDFs?", a: "Right after payment your download page opens instantly, and the same PDF links are delivered to your email." },
  { q: "Who is it for?", a: "MBBS, BAMS, BHMS, nursing, pharmacy (B.Pharm / D.Pharm), paramedical students and interns." },
  { q: "Can I buy add-ons later?", a: "No — add-ons can only be purchased together with the 6 PDF combo on this page." },
  { q: "Refund policy?", a: "These are digital products with instant access — no refunds once the PDFs are downloaded." },
  { q: "Can I use it for treatment decisions?", a: "No. These are educational quick-reference guides only. They do not replace textbooks, clinical training or a qualified doctor." },
];

const BUY_POINTS = [
  "Disease, Medicine, Lab Report, Emergency, ECG & Ayurvedic guides",
  "Visual, quick-reference format for study and revision",
  "Instant PDF — mobile, tablet or laptop",
];

export default function MedicalCombo6() {
  const [combo, setCombo] = useState(null);
  const [addOns, setAddOns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Ledgerkit 6 PDF Medical Combo — Instant Download";
    api.get(`/products/${COMBO_SLUG}`).then((r) => setCombo(r.data)).catch(() => {});
    api.get("/combo-6/add-ons").then((r) => setAddOns(r.data)).catch(() => {});
    api.get("/testimonials", { params: { product_slug: COMBO_SLUG } }).then((r) => setReviews(r.data || [])).catch(() => {});
  }, []);

  const comboPrice = combo?.editions?.digital?.price ?? combo?.sale_price ?? FALLBACK_PRICE;
  const addOnPrice = (a) => a?.editions?.digital?.price ?? a?.sale_price ?? 0;
  const total = useMemo(
    () => comboPrice + addOns.filter((a) => selected.includes(a.slug)).reduce((s, a) => s + addOnPrice(a), 0),
    [comboPrice, addOns, selected],
  );

  const toggleAddOn = (slug) =>
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const openBuy = () => setDialogOpen(true);

  const pay = (email) => {
    setBusy(true);
    startRazorpayCheckout({
      items: [{ product_slug: COMBO_SLUG, edition: "digital" }, ...selected.map((s) => ({ product_slug: s, edition: "digital" }))],
      email,
      onError: () => setBusy(false),
      onDismiss: () => setBusy(false),
    });
  };

  return (
    <div className="bg-white" data-testid="medical-combo6-page">
      {/* TOP BAR */}
      <div className="bg-ink-surface px-4 py-2.5 text-center" data-testid="combo6-topbar">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">
          Launch offer: 6 Medical PDF Guides for {formatINR(comboPrice)} · <span className="text-brand-400">Instant download</span>
        </p>
      </div>

      {/* HERO */}
      <section className="bg-ink-surface px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8" data-testid="combo6-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-400">
              6 guides · one pack · one-time payment
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Six medical guides. <span className="text-brand-400">One instant download.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
              Diseases, medicines, lab reports, emergencies, ECG and Ayurveda — explained with visual diagrams, structured tables and easy-to-read pages you can keep on your phone.
            </p>
            <ul className="mt-6 space-y-3">
              {BUY_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15">
                    <Check className="h-3 w-3 text-brand-400" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={openBuy}
                data-testid="combo6-hero-buy-button"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-7 py-4 font-display text-base font-extrabold text-ink-surface transition-colors duration-200 hover:bg-[#ffe14d]"
              >
                Download all 6 — {formatINR(total)} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Instant PDF access · Secure payment
            </p>
          </Reveal>
          <Reveal className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <img
                src="/samples/combo-6/bundle-6-books.png"
                alt="Ledgerkit 6 medical PDF guides combo"
                className="w-full rounded-2xl border border-white/10 shadow-2xl"
                loading="eager"
                data-testid="combo6-hero-image"
              />
              <span className="absolute -right-3 -top-3 flex h-20 w-20 rotate-6 items-center justify-center rounded-full bg-brand-400 text-center font-display text-lg font-extrabold leading-tight text-ink-surface shadow-lg" data-testid="combo6-price-badge">
                {formatINR(comboPrice)}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="border-b border-slate-100 px-4 py-10 sm:px-6 lg:px-8" data-testid="combo6-audience">
        <div className="mx-auto max-w-6xl">
          <p className="text-center font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">Built for</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {AUDIENCE.map((a) => (
              <span key={a} className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700" data-testid={`combo6-audience-${a.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENCE */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-difference">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Why these guides" title="Not another heavy textbook" description="Every page is designed for fast understanding and faster revision — the difference is in the format." testId="combo6-difference" />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {DIFFERENCE.map((d) => (
              <Reveal key={d.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-subtle">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100">
                  <d.icon className="h-5 w-5 text-brand-600" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{d.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-guides">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="What you get" title="All 6 guides inside the combo" description="Every guide is a complete, standalone quick-reference PDF." testId="combo6-guides" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((g, i) => (
              <Reveal key={g.key} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle transition-shadow duration-200 hover:shadow-card-hover" data-testid={`combo6-guide-${g.key}`}>
                <div className="relative bg-gradient-to-b from-slate-100 to-white p-6">
                  <img src={g.cover} alt={g.title} className="mx-auto h-52 w-auto rounded-lg object-contain drop-shadow-xl transition-transform duration-300 group-hover:-translate-y-1" loading="lazy" />
                  <span className="absolute left-4 top-4 rounded-full bg-ink-surface px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    {String(i + 1).padStart(2, "0")}{g.pages ? ` · ${g.pages}` : ""}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 pt-4">
                  <h3 className="font-display text-base font-bold text-ink">{g.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{g.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE PAGES */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-samples">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Look inside" title="Guide by guide" description="Tap a guide to see it up close." testId="combo6-samples" />
          <Tabs defaultValue="disease" className="mt-10" data-testid="combo6-sample-tabs">
            <TabsList className="mx-auto flex h-auto w-full max-w-3xl flex-wrap justify-center gap-1.5 bg-slate-100 p-1.5">
              {GUIDES.map((g) => (
                <TabsTrigger key={g.key} value={g.key} className="px-3 py-2 text-xs font-semibold sm:text-sm" data-testid={`combo6-tab-${g.key}`}>
                  {g.title.replace(" Reference Guide", "").replace(" Medical Guide", "").replace(" Medicine Guide", "")}
                </TabsTrigger>
              ))}
            </TabsList>
            {GUIDES.map((g) => (
              <TabsContent key={g.key} value={g.key} className="mt-8">
                <div className="grid items-center gap-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-[auto_1fr] sm:p-10">
                  <img src={g.cover} alt={`${g.title} cover`} className="mx-auto h-64 w-auto rounded-xl object-contain drop-shadow-2xl" loading="lazy" />
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">{g.title}{g.pages ? <span className="ml-2 text-sm font-semibold text-slate-500">· {g.pages}</span> : null}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.desc}</p>
                    <ul className="mt-4 space-y-2.5">
                      {g.points.map((p) => (
                        <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700">
                          <Check className="h-4 w-4 shrink-0 text-brand-600" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-how">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="How it works" title="From payment to PDF in under a minute" testId="combo6-how" />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-subtle">
                <span className="font-display text-4xl font-extrabold text-brand-200">{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-pricing">
        <div className="mx-auto max-w-2xl">
          <SectionHeading eyebrow="Launch offer" title="One pack. One payment. Yours forever." testId="combo6-pricing" />
          <Reveal className="mt-10 overflow-hidden rounded-2xl border-2 border-ink-surface bg-white shadow-card-hover">
            <div className="bg-ink-surface px-7 py-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-white">Ledgerkit 6 PDF Combo</h3>
                  <p className="mt-1 text-xs text-slate-400">One-time · instant PDF · all 6 guides</p>
                </div>
                <div className="text-right">
                  {combo?.regular_price ? <span className="block text-sm text-slate-500 line-through">{formatINR(combo.regular_price)}</span> : null}
                  <span className="font-display text-3xl font-extrabold text-brand-400" data-testid="combo6-main-price">{formatINR(comboPrice)}</span>
                </div>
              </div>
            </div>
            <div className="px-7 py-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Optional add-ons — only with this combo</p>
              <div className="mt-3 space-y-2.5">
                {addOns.map((a) => {
                  const on = selected.includes(a.slug);
                  return (
                    <button
                      key={a.slug}
                      type="button"
                      onClick={() => toggleAddOn(a.slug)}
                      aria-pressed={on}
                      data-testid={`combo6-addon-${a.slug}`}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150 ${on ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"}`}>
                        {on && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-ink">{a.title}</span>
                      <span className="text-sm font-bold text-brand-700">+ {formatINR(addOnPrice(a))}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
                <span className="text-sm font-semibold text-slate-600">Total{selected.length ? ` (combo + ${selected.length} add-on${selected.length > 1 ? "s" : ""})` : ""}</span>
                <span className="font-display text-2xl font-extrabold text-ink" data-testid="combo6-total">{formatINR(total)}</span>
              </div>
              <button
                onClick={openBuy}
                data-testid="combo6-pricing-buy-button"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 font-display text-base font-extrabold text-white transition-colors duration-200 hover:bg-brand-700"
              >
                Buy now — {formatINR(total)} <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> UPI · Cards · Netbanking — secure payment via Razorpay
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* REVIEWS — only rendered when real buyer reviews exist */}
      {reviews.length > 0 && (
        <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-reviews">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Reviews" title="What students say" testId="combo6-reviews" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle">
                  <p className="text-sm leading-relaxed text-slate-700">"{r.text || r.review}"</p>
                  <p className="mt-4 text-sm font-bold text-ink">{r.name}</p>
                  {r.role && <p className="text-xs text-slate-500">{r.role}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-faq">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" testId="combo6-faq" />
          <div className="mt-10">
            <FaqAccordion items={FAQS} testId="combo6-faq" />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink-surface px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-final-cta">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your quick-reference library for study and revision
          </h2>
          <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-widest text-brand-400">
            6 practical guides · Instant PDF · Mobile, tablet &amp; laptop
          </p>
          <p className="mt-6 font-display text-5xl font-extrabold text-white">
            Just <span className="text-brand-400">{formatINR(total)}</span>
          </p>
          <button
            onClick={openBuy}
            data-testid="combo6-final-buy-button"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-8 py-4 font-display text-base font-extrabold text-ink-surface transition-colors duration-200 hover:bg-[#ffe14d]"
          >
            Download now <ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>
      </section>

      {/* DISCLAIMER + CONTACT */}
      <section className="border-t border-slate-100 px-4 py-10 sm:px-6 lg:px-8" data-testid="combo6-disclaimer">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs leading-relaxed text-slate-500">
            <Stethoscope className="mr-1 inline h-3.5 w-3.5" />
            Ledgerkit guides are educational and quick-reference resources only. They are not a prescription and do not replace textbooks, clinical training or a qualified doctor or Vaidya.
          </p>
          <a href="mailto:medicalmasterbook@gmail.com" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700" data-testid="combo6-contact-email">
            <Mail className="h-3.5 w-3.5" /> medicalmasterbook@gmail.com
          </a>
        </div>
      </section>

      {/* STICKY MOBILE BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden" data-testid="combo6-sticky-bar">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-ink">6 Medical PDF Guides</p>
            <p className="text-[10px] text-slate-500">Instant download</p>
          </div>
          <button
            onClick={openBuy}
            data-testid="combo6-sticky-buy-button"
            className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 font-display text-sm font-extrabold text-white transition-colors duration-200 hover:bg-brand-700"
          >
            Buy for {formatINR(total)}
          </button>
        </div>
      </div>
      <div className="h-16 sm:hidden" />

      <BuyerEmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={pay}
        busy={busy}
        productTitle="the 6 PDF Medical Combo"
        total={total}
      />
    </div>
  );
}

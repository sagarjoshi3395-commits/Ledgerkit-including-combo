import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck, Download, Zap, BookOpen, Stethoscope, ArrowRight, Loader2, Mail, Timer, Smartphone, Lock, GraduationCap, Pill, HeartPulse, Eye, X, Star, ChevronDown } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useOfferTimer } from "@/lib/offerTimer";
import { toast } from "sonner";
import { startRazorpayCheckout } from "@/lib/razorpay";
import { trackEvent, getStoredUtms } from "@/lib/analytics";
import BuyerEmailDialog from "@/components/BuyerEmailDialog";
import FaqAccordion from "@/components/FaqAccordion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

const COMBO_SLUG = "medical-6-pdf-combo";
const FALLBACK_PRICE = 290;
const PAGE_DIR = "/samples/combo-6/pages";
const pages = (k) => [1, 2, 3, 4, 5].map((n) => `${PAGE_DIR}/${k}-${n}.webp`);

const GUIDES = [
  { key: "disease", tab: "Disease", title: "Disease Reference Guide", cover: "/samples/combo-6/cover-disease.webp", color: "#2563EB", desc: "120+ common diseases: causes, symptoms, diagnosis, treatment overview.", points: ["120+ common diseases", "Causes & symptoms", "Diagnosis & treatment overview"], tags: ["120+ diseases", "Causes & symptoms", "Diagnosis", "Treatment overview"] },
  { key: "medicine", tab: "Medicine", title: "Medicine Reference Guide", cover: "/samples/combo-6/cover-medicine.webp", color: "#6D28D9", desc: "Common medicines: drug class, uses, side effects, key points.", points: ["Drug class & uses", "Side effects", "Key points at a glance"], tags: ["Drug classes", "Uses & dosage", "Side effects", "Important notes"] },
  { key: "lab", tab: "Lab Report", title: "Lab Report Decode", pages: "86 pages", cover: "/samples/combo-6/cover-lab-report.webp", color: "#1D4ED8", desc: "CBC, liver, kidney, thyroid, ABG and report patterns.", points: ["CBC, LFT, KFT, thyroid", "ABG interpretation", "Common report patterns"], tags: ["CBC, LFT & KFT", "Thyroid & ABG", "Report patterns", "Normal vs abnormal"] },
  { key: "emergency", tab: "Emergency", title: "Emergency Medical Guide", pages: "73 pages", cover: "/samples/combo-6/cover-emergency.webp", color: "#DC2626", desc: "ABCDE, CPR, shock, triage, drug quick reference.", points: ["ABCDE & CPR", "Shock & triage", "Emergency drug quick reference"], tags: ["ABCDE approach", "CPR steps", "Shock & triage", "Drug quick reference"] },
  { key: "ecg", tab: "ECG", title: "ECG Reading Guide", pages: "59 pages", cover: "/samples/combo-6/cover-ecg.webp", color: "#E11D48", desc: "ECG basics, rhythms, AV blocks, step-by-step approach.", points: ["ECG basics", "Rhythms & AV blocks", "Step-by-step approach"], tags: ["Rhythm strips", "AV blocks", "Step-by-step method", "Real examples"] },
  { key: "ayurvedic", tab: "Ayurvedic", title: "Ayurvedic Medicine Guide", pages: "78 pages", cover: "/samples/combo-6/cover-ayurvedic.webp", color: "#16A34A", desc: "Common Ayurvedic medicines and uses, English + Hindi.", points: ["Common Ayurvedic medicines", "Uses & dosage guidance", "English + Hindi"], tags: ["Common medicines", "Uses & benefits", "Dosage guidance", "English + Hindi"] },
];

const SAMPLE_ORDER = ["medicine", "disease", "emergency", "ayurvedic", "ecg", "lab"];

const HERO_AUDIENCE = [
  { icon: GraduationCap, label: "Medical Students" },
  { icon: Stethoscope, label: "Doctors" },
  { icon: Pill, label: "Pharmacists" },
  { icon: HeartPulse, label: "Nurses" },
];

const BEFORE_AFTER = [
  { who: "Medical students", without: "Flipping through 1,000-page textbooks the night before an exam and still missing key points.", with: "Disease, ECG & lab summaries in visual tables — revise a full topic in 5 minutes." },
  { who: "Doctors & interns", without: "Second-guessing ECG rhythms, lab values or emergency steps during busy rounds.", with: "Step-by-step ECG approach, normal vs abnormal lab ranges and ABCDE/CPR flowcharts on your phone." },
  { who: "Pharmacists", without: "Searching multiple apps for drug class, uses and side effects while a patient waits.", with: "Drug class, uses, dosage & side effects on one page — plus Ayurvedic medicines in English + Hindi." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", course: "MBBS, 3rd year · Jaipur", text: "The ECG guide finally made rhythms click for me. I keep it on my phone and go through it before ward postings — the step-by-step approach is very clear." },
  { name: "Rahul Verma", course: "B.Pharm, final year · Lucknow", text: "During my pharmacy internship the medicine guide was the one I opened most. Drug class, uses and side effects on one page saves a lot of time." },
  { name: "Sneha Patil", course: "B.Sc Nursing · Pune", text: "The emergency guide's ABCDE and CPR flowcharts are simple and easy to remember. For this price, getting all six guides is good value." },
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
  { q: "Can I use it for treatment decisions?", a: "No. These are educational quick-reference guides only. They do not replace textbooks, clinical training or a qualified doctor." },
];

export default function MedicalCombo6() {
  const [combo, setCombo] = useState(null);
  const [addOns, setAddOns] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const offerSecs = useOfferTimer(9);
  const offerClock = offerSecs == null ? null : `${String(Math.floor(offerSecs / 60)).padStart(2, "0")}:${String(offerSecs % 60).padStart(2, "0")}`;

  useEffect(() => {
    document.title = "Ledgerkit 6 PDF Medical Combo — Instant Download";
    api.get(`/products/${COMBO_SLUG}`).then((r) => setCombo(r.data)).catch(() => {});
    api.get("/combo-6/add-ons").then((r) => setAddOns(r.data)).catch(() => {});
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
  const scrollToPricing = () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });

  const [showAllSamples, setShowAllSamples] = useState(false);
  const scrollToSamples = () => document.getElementById("samples")?.scrollIntoView({ behavior: "smooth" });
  const sampleGuides = SAMPLE_ORDER.slice(0, showAllSamples ? 6 : 4).map((k) => GUIDES.find((g) => g.key === k));

  const pay = async ({ email, phone } = {}) => {
    setBusy(true);
    trackEvent("InitiateCheckout", {
      content_name: COMBO_SLUG,
      content_ids: [COMBO_SLUG, ...selected],
      num_items: 1 + selected.length,
      value: total,
      currency: "INR",
      ...getStoredUtms(),
    });
    const opened = await startRazorpayCheckout({
      items: [{ product_slug: COMBO_SLUG, edition: "digital" }, ...selected.map((s) => ({ product_slug: s, edition: "digital" }))],
      email,
      phone,
      onError: (msg) => {
        setBusy(false);
        toast.error("Couldn't start checkout", { description: msg, duration: 8000 });
      },
      onDismiss: () => setBusy(false),
    });
    // Close our Radix dialog once Razorpay is on screen: an open dialog sets
    // body pointer-events:none + focus trap, which makes the Razorpay iframe unusable.
    if (opened) {
      setBusy(false);
      setDialogOpen(false);
    } else setBusy(false);
  };

  return (
    <div className="bg-white" data-testid="medical-combo6-page">
      <style>{`
        @keyframes c6float{0%,100%{transform:translateY(0) rotate(6deg)}50%{transform:translateY(-8px) rotate(6deg)}}
        .c6-float{animation:c6float 3.2s ease-in-out infinite}
        @keyframes c6chipfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .c6-chipfloat{animation:c6chipfloat 3.6s ease-in-out infinite}
        @keyframes c6pulse{0%,100%{opacity:1}50%{opacity:.55}}
        .c6-pulse{animation:c6pulse 1.6s ease-in-out infinite}
        @keyframes c6glowY{0%,100%{box-shadow:0 0 0 0 rgba(255,212,0,.45)}50%{box-shadow:0 0 0 10px rgba(255,212,0,0)}}
        .c6-glow{animation:c6glowY 2s ease-out infinite}
        @keyframes c6glowV{0%,100%{box-shadow:0 0 0 0 rgba(46,26,200,.4)}50%{box-shadow:0 0 0 10px rgba(46,26,200,0)}}
        .c6-glow-violet{animation:c6glowV 2s ease-out infinite}
        @keyframes c6flowL{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes c6flowR{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        .c6-row{display:flex;width:max-content;gap:1rem;will-change:transform}
        .c6-left{animation:c6flowL 38s linear infinite}
        .c6-right{animation:c6flowR 38s linear infinite}
        .c6-mask{overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)}
        @media (prefers-reduced-motion:reduce){.c6-left,.c6-right{animation:none}}
      `}</style>
      {/* TOP BAR */}
      <div className="bg-brand-400 px-4 py-2.5 text-center" data-testid="combo6-topbar">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-surface">
          Launch offer: 6 Medical PDF Guides for {formatINR(comboPrice)} <span className="text-ink-surface/55 line-through">₹1,699</span> · Instant download
          {offerClock && (
            <span className="c6-pulse ml-2 inline-flex items-center gap-1 rounded-full bg-ink-surface px-2 py-0.5 text-brand-400" data-testid="combo6-topbar-timer">
              <Timer className="h-3 w-3" /> Ends in <span className="tabular-nums">{offerClock}</span>
            </span>
          )}
        </p>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8" data-testid="combo6-hero">
        <div className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-ember px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white shadow-subtle" data-testid="combo6-hero-badge">
              6 medical guides · 1 powerful combo
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl" data-testid="combo6-hero-title">
              Essential Medical Guides — <span className="text-brand-600">Medicines, Diseases, ECG &amp; Emergency Care</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600" data-testid="combo6-hero-subtitle">
              Stop digging through heavy textbooks. Find drug uses, disease symptoms, ECG rhythms and emergency steps in seconds — clear tables and flowcharts you can revise anywhere, plus Ayurvedic medicines and lab report decoding.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {HERO_AUDIENCE.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-subtle" data-testid={`combo6-hero-for-${c.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <c.icon className="h-4 w-4 shrink-0 text-brand-600" /> For {c.label}
                </span>
              ))}
            </div>
            <ul className="mt-6 space-y-2">
              {["Instant PDF download", "Easy visuals, tables & flowcharts", "Read on phone, tablet or laptop"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500"><Check className="h-3.5 w-3.5 text-white" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={scrollToSamples}
                data-testid="combo6-hero-preview-button"
                className="c6-glow inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-7 py-4 font-display text-base font-extrabold text-ink-surface transition-colors duration-200 hover:bg-[#ffe14d]"
              >
                <Eye className="h-4 w-4" /> Preview sample pages <ChevronDown className="h-4 w-4" />
              </button>
              {offerClock && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500" data-testid="combo6-hero-timer">
                  <Timer className="h-3.5 w-3.5 text-ember" /> Launch offer ends in <span className="tabular-nums text-ember">{offerClock}</span>
                </span>
              )}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Secure payment · Instant access · Colourful PDF
            </p>
          </Reveal>
          <Reveal className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-tr from-brand-600/15 via-brand-400/25 to-transparent blur-2xl" />
              <img
                src="/samples/combo-6/bundle-6-books.webp"
                alt="Ledgerkit 6 essential medical guides combo"
                className="relative w-full rounded-3xl border border-slate-200 bg-white shadow-2xl"
                width="1100"
                height="825"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                data-testid="combo6-hero-image"
              />
              <span className="c6-float absolute -right-3 -top-3 flex h-20 w-20 rotate-6 flex-col items-center justify-center rounded-full bg-brand-600 text-center font-display font-extrabold leading-tight text-white shadow-lg" data-testid="combo6-combo-badge">
                <span className="text-xl">6 in 1</span>
                <span className="text-[10px] uppercase tracking-wider">Combo</span>
              </span>
              <span className="c6-chipfloat absolute -left-3 top-10 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2 text-xs font-bold text-ink shadow-xl backdrop-blur sm:flex">
                <Download className="h-3.5 w-3.5 text-brand-600" /> Instant PDF
              </span>
              <span className="c6-chipfloat absolute -left-4 bottom-12 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2 text-xs font-bold text-ink shadow-xl backdrop-blur sm:flex" style={{ animationDelay: "1.6s" }}>
                <BookOpen className="h-3.5 w-3.5 text-brand-600" /> 6 guides inside
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUST BAND */}
      <section className="border-b border-slate-100 bg-white px-4 py-6 sm:px-6 lg:px-8" data-testid="combo6-trust-band">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Lock, title: "Secure checkout", text: "Razorpay encrypted" },
            { icon: Download, title: "Instant delivery", text: "PDFs the moment you pay" },
            { icon: Smartphone, title: "All devices", text: "Mobile, tablet & laptop" },
            { icon: Mail, title: "Email support", text: "We reply to every query" },
          ].map((t) => (
            <div key={t.title} className="flex items-center gap-3" data-testid={`combo6-trust-${t.title.toLowerCase().split(" ")[0]}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <t.icon className="h-4 w-4 text-brand-700" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink sm:text-sm">{t.title}</p>
                <p className="truncate text-[11px] text-slate-500">{t.text}</p>
              </div>
            </div>
          ))}
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

      {/* SAMPLE PAGES — flowing rows, alternate directions, non-clickable */}
      <section id="samples" className="scroll-mt-20 bg-slate-50 py-16" data-testid="combo6-samples">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="Sample pages" title="Look inside — real pages from every guide" description="Exactly how the guides look inside: colourful, visual and easy to revise." testId="combo6-samples" />
        </div>
        <div className="mt-10 space-y-10">
          {sampleGuides.map((g, i) => (
            <div key={g.key} data-testid={`combo6-flow-${g.key}`}>
              <div className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center">
                <span className="rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: g.color }}>{g.title}</span>
                <span className="text-xs font-semibold text-slate-500">{g.tags.join(" · ")}</span>
              </div>
              <div className="c6-mask py-1" style={{ pointerEvents: "none" }}>
                <div className={`c6-row ${i % 2 === 0 ? "c6-left" : "c6-right"}`}>
                  {[...pages(g.key), ...pages(g.key)].map((src, j) => (
                    <img
                      key={`${src}-${j}`}
                      src={src}
                      alt={`${g.title} sample page`}
                      width="360"
                      height="640"
                      className="h-64 w-36 shrink-0 select-none rounded-xl border border-slate-200 bg-white object-cover object-top shadow-subtle sm:h-80 sm:w-[180px]"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 px-4">
          {!showAllSamples && (
            <button
              type="button"
              onClick={() => setShowAllSamples(true)}
              data-testid="combo6-show-more-samples"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-ink transition-colors duration-200 hover:border-brand-600 hover:text-brand-700"
            >
              See ECG &amp; Lab Report pages <ChevronDown className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={scrollToPricing}
            data-testid="combo6-sample-cta"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 font-display text-sm font-extrabold text-white transition-colors duration-200 hover:bg-brand-700"
          >
            Get all 6 guides – {formatINR(comboPrice)} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* WITHOUT vs WITH */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-compare">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="The difference" title="Without the combo vs with the combo" description="The same daily problems — solved in seconds instead of hours." testId="combo6-compare" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {BEFORE_AFTER.map((b) => (
              <Reveal key={b.who} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle" data-testid={`combo6-compare-${b.who.split(" ")[0].toLowerCase()}`}>
                <p className="bg-ink-surface px-6 py-3 font-display text-sm font-extrabold text-white">{b.who}</p>
                <div className="flex gap-3 border-b border-dashed border-slate-200 bg-rose-50/60 px-6 py-5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500"><X className="h-3.5 w-3.5 text-white" /></span>
                  <p className="text-sm leading-relaxed text-slate-700"><span className="font-bold text-rose-600">Without: </span>{b.without}</p>
                </div>
                <div className="flex gap-3 bg-emerald-50/60 px-6 py-5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500"><Check className="h-3.5 w-3.5 text-white" /></span>
                  <p className="text-sm leading-relaxed text-slate-700"><span className="font-bold text-emerald-700">With the combo: </span>{b.with}</p>
                </div>
              </Reveal>
            ))}
          </div>
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
              <p className="mt-2 text-right text-xs font-semibold text-emerald-600" data-testid="combo6-save-note">
                You save {formatINR((combo?.regular_price ?? 1699) - comboPrice)} on the combo (MRP {formatINR(combo?.regular_price ?? 1699)})
              </p>
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
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2" data-testid="combo6-payment-methods">
                {["UPI", "Visa", "Mastercard", "RuPay", "Netbanking"].map((m) => (
                  <span key={m} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-reviews">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Reviews" title="What readers say" testId="combo6-reviews" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((r) => (
              <Reveal key={r.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle" data-testid={`combo6-review-${r.name.split(" ")[0].toLowerCase()}`}>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((n) => <Star key={n} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">"{r.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-extrabold text-brand-700">{r.name[0]}</span>
                  <div>
                    <p className="text-sm font-bold text-ink">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.course}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
          <p className="mt-2 text-sm text-slate-400">
            <span className="line-through">₹1,699</span> · Launch offer{offerClock ? <span className="c6-pulse ml-1 font-bold text-brand-400">ends in {offerClock}</span> : ""}
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

      {/* STICKY CHECKOUT BAR — all screens */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md" data-testid="combo6-sticky-bar">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-ink sm:text-sm">
              6 Medical PDF Guides <span className="ml-1 text-slate-400 line-through">₹1,699</span> <span className="text-brand-700">{formatINR(comboPrice)}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              Instant download
              {offerClock && (
                <span className="c6-pulse ml-1.5 inline-flex items-center gap-1 font-bold text-ember" data-testid="combo6-sticky-timer">
                  <Timer className="h-3 w-3" /> {offerClock} left
                </span>
              )}
            </p>
          </div>
          <button
            onClick={openBuy}
            data-testid="combo6-sticky-buy-button"
            className="c6-glow-violet shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 font-display text-sm font-extrabold text-white transition-colors duration-200 hover:bg-brand-700 sm:px-7 sm:py-3"
          >
            Buy for {formatINR(total)}
          </button>
        </div>
      </div>
      <div className="h-16" />

      <BuyerEmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={pay}
        busy={busy}
        productTitle="the 6 PDF Medical Combo"
        total={total}
        addOns={addOns}
        selectedAddOns={selected}
        onToggleAddOn={toggleAddOn}
        addOnPrice={addOnPrice}
      />
    </div>
  );
}

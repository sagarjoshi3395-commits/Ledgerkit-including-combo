import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ShieldCheck, Download, Zap, BookOpen, Stethoscope, ArrowRight, Loader2, Mail, Timer } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useOfferTimer } from "@/lib/offerTimer";
import { toast } from "sonner";
import { startRazorpayCheckout } from "@/lib/razorpay";
import BuyerEmailDialog from "@/components/BuyerEmailDialog";
import FaqAccordion from "@/components/FaqAccordion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

const COMBO_SLUG = "medical-6-pdf-combo";
const FALLBACK_PRICE = 297;
const VIDEO_DIR = "/samples/combo-6/videos";

const GUIDES = [
  { key: "disease", tab: "Disease", title: "Disease Reference Guide", cover: "/samples/combo-6/cover-disease.png", video: `${VIDEO_DIR}/disease_reference_guide_page_flow_web.mp4`, color: "#2563EB", desc: "120+ common diseases: causes, symptoms, diagnosis, treatment overview.", points: ["120+ common diseases", "Causes & symptoms", "Diagnosis & treatment overview"], tags: ["120+ diseases", "Causes & symptoms", "Diagnosis", "Treatment overview"] },
  { key: "medicine", tab: "Medicine", title: "Medicine Reference Guide", cover: "/samples/combo-6/cover-medicine.png", video: `${VIDEO_DIR}/medicine_reference_guide_page_flow_web.mp4`, color: "#6D28D9", desc: "Common medicines: drug class, uses, side effects, key points.", points: ["Drug class & uses", "Side effects", "Key points at a glance"], tags: ["Drug classes", "Uses & dosage", "Side effects", "Important notes"] },
  { key: "lab", tab: "Lab Report", title: "Lab Report Decode", pages: "86 pages", cover: "/samples/combo-6/cover-lab-report.png", video: `${VIDEO_DIR}/lab_report_decode_page_flow_web.mp4`, color: "#1D4ED8", desc: "CBC, liver, kidney, thyroid, ABG and report patterns.", points: ["CBC, LFT, KFT, thyroid", "ABG interpretation", "Common report patterns"], tags: ["CBC, LFT & KFT", "Thyroid & ABG", "Report patterns", "Normal vs abnormal"] },
  { key: "emergency", tab: "Emergency", title: "Emergency Medical Guide", pages: "73 pages", cover: "/samples/combo-6/cover-emergency.png", video: `${VIDEO_DIR}/emergency_medical_guide_page_flow_web.mp4`, color: "#DC2626", desc: "ABCDE, CPR, shock, triage, drug quick reference.", points: ["ABCDE & CPR", "Shock & triage", "Emergency drug quick reference"], tags: ["ABCDE approach", "CPR steps", "Shock & triage", "Drug quick reference"] },
  { key: "ecg", tab: "ECG", title: "ECG Reading Guide", pages: "59 pages", cover: "/samples/combo-6/cover-ecg.png", video: `${VIDEO_DIR}/ecg_reading_guide_page_flow_web.mp4`, color: "#E11D48", desc: "ECG basics, rhythms, AV blocks, step-by-step approach.", points: ["ECG basics", "Rhythms & AV blocks", "Step-by-step approach"], tags: ["Rhythm strips", "AV blocks", "Step-by-step method", "Real examples"] },
  { key: "ayurvedic", tab: "Ayurvedic", title: "Ayurvedic Medicine Guide", pages: "78 pages", cover: "/samples/combo-6/cover-ayurvedic.png", video: `${VIDEO_DIR}/ayurvedic_medicine_guide_page_flow_web.mp4`, color: "#16A34A", desc: "Common Ayurvedic medicines and uses, English + Hindi.", points: ["Common Ayurvedic medicines", "Uses & dosage guidance", "English + Hindi"], tags: ["Common medicines", "Uses & benefits", "Dosage guidance", "English + Hindi"] },
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
  const offerSecs = useOfferTimer(9);
  const offerClock = offerSecs == null ? null : `${String(Math.floor(offerSecs / 60)).padStart(2, "0")}:${String(offerSecs % 60).padStart(2, "0")}`;

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
  const scrollToPricing = () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });

  const [activeGuide, setActiveGuide] = useState("disease");
  const [nearSamples, setNearSamples] = useState(false);
  const samplesRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const el = samplesRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearSamples(true);
          obs.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [activeGuide, nearSamples]);

  const activeGuideData = GUIDES.find((g) => g.key === activeGuide) || GUIDES[0];

  const pay = (email) => {
    setBusy(true);
    startRazorpayCheckout({
      items: [{ product_slug: COMBO_SLUG, edition: "digital" }, ...selected.map((s) => ({ product_slug: s, edition: "digital" }))],
      email,
      onError: (msg) => {
        setBusy(false);
        toast.error("Couldn't start checkout", { description: msg, duration: 8000 });
      },
      onDismiss: () => setBusy(false),
    });
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
      `}</style>
      {/* TOP BAR */}
      <div className="bg-ink-surface px-4 py-2.5 text-center" data-testid="combo6-topbar">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">
          Launch offer: 6 Medical PDF Guides for {formatINR(comboPrice)} <span className="text-slate-500 line-through">₹1,699</span> · <span className="text-brand-400">Instant download</span>
          {offerClock && (
            <span className="c6-pulse ml-2 inline-flex items-center gap-1 rounded-full bg-brand-400 px-2 py-0.5 text-ink-surface" data-testid="combo6-topbar-timer">
              <Timer className="h-3 w-3" /> Ends in <span className="tabular-nums">{offerClock}</span>
            </span>
          )}
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
            <div className="mt-8 flex items-end gap-3">
              <span className="font-display text-4xl font-extrabold text-white" data-testid="combo6-hero-price">{formatINR(comboPrice)}</span>
              <span className="pb-1 text-lg text-slate-500 line-through">₹1,699</span>
              <span className="mb-1 rounded-full bg-brand-400/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-400">Save 82%</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={openBuy}
                data-testid="combo6-hero-buy-button"
                className="c6-glow inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-7 py-4 font-display text-base font-extrabold text-ink-surface transition-colors duration-200 hover:bg-[#ffe14d]"
              >
                Download all 6 — {formatINR(total)} <ArrowRight className="h-4 w-4" />
              </button>
              {offerClock && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300" data-testid="combo6-hero-timer">
                  <Timer className="h-3.5 w-3.5 text-brand-400" /> Offer ends in <span className="tabular-nums text-brand-400">{offerClock}</span>
                </span>
              )}
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
              <span className="c6-float absolute -right-3 -top-3 flex h-20 w-20 rotate-6 flex-col items-center justify-center rounded-full bg-brand-400 text-center font-display font-extrabold leading-tight text-ink-surface shadow-lg" data-testid="combo6-price-badge">
                <span className="text-[10px] line-through opacity-70">₹1,699</span>
                <span className="text-lg">{formatINR(comboPrice)}</span>
              </span>
              <span className="c6-chipfloat absolute -left-3 top-10 hidden items-center gap-2 rounded-xl border border-white/10 bg-ink-card/90 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur sm:flex">
                <Download className="h-3.5 w-3.5 text-brand-400" /> Instant PDF
              </span>
              <span className="c6-chipfloat absolute -left-4 bottom-12 hidden items-center gap-2 rounded-xl border border-white/10 bg-ink-card/90 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur sm:flex" style={{ animationDelay: "1.6s" }}>
                <BookOpen className="h-3.5 w-3.5 text-brand-400" /> 6 guides inside
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

      {/* SAMPLE PAGES — video previews in a phone mockup */}
      <section ref={samplesRef} className="px-4 py-16 sm:px-6 lg:px-8" data-testid="combo6-samples">
        <style>{`@keyframes c6fade{from{opacity:0}to{opacity:1}}.c6-fade{animation:c6fade .3s ease}`}</style>
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Sample pages" title="Look inside – guide by guide" description="Tap a guide to see its real pages." testId="combo6-samples" />
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible" data-testid="combo6-video-tabs">
            {GUIDES.map((g) => {
              const on = g.key === activeGuide;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setActiveGuide(g.key)}
                  aria-pressed={on}
                  data-testid={`combo6-vtab-${g.key}`}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors duration-200 sm:text-sm ${on ? "border-transparent text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"}`}
                  style={on ? { backgroundColor: g.color } : undefined}
                >
                  <img src={g.cover} alt="" className="h-7 w-7 rounded-full object-cover" loading="lazy" />
                  {g.tab}
                </button>
              );
            })}
          </div>
          <div className="mt-8 grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-card-hover sm:p-10 lg:grid-cols-[auto_1fr]" data-testid="combo6-video-panel">
            <div className="mx-auto w-[230px] sm:w-[260px]">
              <div className="rounded-[2.6rem] bg-ink-surface p-2.5 shadow-2xl">
                <div className="relative overflow-hidden rounded-[2rem] bg-black" style={{ aspectRatio: "9/16" }}>
                  <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-ink-surface" />
                  {nearSamples ? (
                    <video
                      key={activeGuideData.key}
                      ref={videoRef}
                      className="c6-fade h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster={activeGuideData.cover}
                      src={activeGuideData.video}
                      data-testid="combo6-video-player"
                    />
                  ) : (
                    <img src={activeGuideData.cover} alt={activeGuideData.title} className="h-full w-full object-cover" loading="lazy" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <span className="inline-block rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: activeGuideData.color }}>
                {activeGuideData.pages || "Quick-reference"}
              </span>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink" data-testid="combo6-video-title">
                {activeGuideData.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{activeGuideData.desc}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {activeGuideData.tags.map((t) => (
                  <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={scrollToPricing}
                data-testid="combo6-sample-cta"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 font-display text-sm font-extrabold text-white transition-colors duration-200 hover:bg-brand-700"
              >
                Get this + 5 more guides – {formatINR(comboPrice)} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
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
      />
    </div>
  );
}

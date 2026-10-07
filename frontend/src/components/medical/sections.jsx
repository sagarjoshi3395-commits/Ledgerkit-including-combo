import React, { useEffect, useState } from "react";
import * as Lucide from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { useMrgBuy } from "./LandingContext";
import { useOfferTimer } from "../../lib/offerTimer";

/* ---------------- content data (ported from the Medical Reference repo) ---------------- */
const A = "https://customer-assets-39nsmqrw.emergentagent.net/job_med-masterbook/artifacts";
const SAMPLES = [
  { title: "Chest Pain", hi: "सीने में दर्द", img: `${A}/fmbxh0cw_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_51_06%20AM%20%285%29.png` },
  { title: "Breathlessness", hi: "साँस फूलना", img: `${A}/o3ft4utk_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_51_06%20AM%20%286%29.png` },
  { title: "Fever", hi: "बुखार", img: `${A}/3fomkte6_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_51_05%20AM%20%282%29.png` },
  { title: "Fatigue & Weakness", hi: "थकान एवं कमजोरी", img: `${A}/vqeicij6_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_51_05%20AM%20%283%29.png` },
  { title: "Edema / Swelling", hi: "सूजन", img: `${A}/3xbb49ud_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_51_06%20AM%20%287%29.png` },
];
const DISEASE_SAMPLES = [
  { title: "Diseases & Clinical Conditions", hi: "रोग एवं क्लिनिकल स्थितियाँ", img: `${A}/n9qyrzvs_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_48_45%20AM%20%281%29.png` },
  ...SAMPLES,
];
const MEDICINE_SAMPLES = [
  { title: "Salbutamol · Codeine", hi: "Respiratory & Pain reference", img: `${A}/0kf1ik4o_ChatGPT%20Image%20Aug%2025%2C%202026%2C%2002_18_29%20AM.png` },
  { title: "Silver Sulfadiazine · Framycetin", hi: "Topical antimicrobial reference", img: `${A}/h7xmxtmr_ChatGPT%20Image%20Aug%2025%2C%202026%2C%2001_02_04%20AM.png` },
  { title: "Alprazolam · Folic Acid", hi: "CNS & Vitamin reference", img: `${A}/xvenntzt_ChatGPT%20Image%20Aug%2024%2C%202026%2C%2008_28_15%20PM.png` },
];
const BILINGUAL_IMG = `${A}/8xbdmg6u_ChatGPT%20Image%20Aug%2026%2C%202026%2C%2001_51_05%20AM%20%283%29.png`;
const COVERS = { disease: "/samples/med-disease-cover.webp", medicine: "/samples/med-medicine-cover.webp" };

const HERO_CHIPS = [
  "Disease Reference Guide", "Medicine Reference Guide", "140+ Topics",
  "Illustrated Learning", "English + Hindi Content", "Digital PDF Access",
];
const DISEASE_SECTIONS = [
  "Quick Definition", "Common Causes", "Symptoms / Clinical Features", "Important Concepts",
  "Assessment", "Management Overview", "Red Flags", "Quick Revision Points",
];
const MEDICINE_SECTIONS = [
  "Drug Class", "Main Uses", "Common Side Effects", "Important Warnings",
  "Precautions", "When to Seek Medical Help", "Key Points", "Additional Reference Information",
];
const DISEASE_CATEGORIES = [
  { icon: "Stethoscope", name: "Common Clinical Presentations", topics: ["Abdominal Pain", "Toothache", "Headache", "Fever", "Cough", "Chest Pain", "Back Pain", "Joint Pain", "Dizziness", "Nausea & Vomiting", "Fatigue & Weakness", "Breathlessness"] },
  { icon: "Soup", name: "Digestive & Gastrointestinal", topics: ["Indigestion", "Constipation", "Diarrhoea", "Gastroenteritis", "Peptic Ulcer Disease", "Gallstones", "Appendicitis", "Haemorrhoids", "Acid Reflux (GERD)"] },
  { icon: "Wind", name: "Respiratory", topics: ["Common Cold", "Influenza", "Asthma", "Bronchitis", "Pneumonia", "Allergic Rhinitis", "Sinusitis", "Sore Throat"] },
  { icon: "HeartPulse", name: "Cardiovascular", topics: ["Hypertension", "Chest Pain (Angina overview)", "Palpitations", "Edema / Swelling", "High Cholesterol"] },
  { icon: "Sparkles", name: "Skin & Allergy", topics: ["Acne", "Eczema", "Urticaria", "Fungal Skin Infections", "Contact Dermatitis", "Ringworm"] },
  { icon: "Bone", name: "Musculoskeletal", topics: ["Muscle Strain", "Sprain", "Osteoarthritis", "Low Back Pain", "Neck Pain", "Gout"] },
  { icon: "Droplets", name: "Urinary & Renal", topics: ["Urinary Tract Infection", "Kidney Stones", "Common Urinary Symptoms"] },
  { icon: "Activity", name: "Metabolic & Endocrine", topics: ["Diabetes (overview)", "Thyroid Disorders (overview)", "Anaemia", "Vitamin Deficiency"] },
  { icon: "Brain", name: "Neurological & Mental Health", topics: ["Migraine", "Vertigo", "Insomnia", "Anxiety (overview)", "Stress-related symptoms"] },
  { icon: "Eye", name: "Eye, Ear & Throat", topics: ["Conjunctivitis", "Ear Pain / Infection", "Tonsillitis", "Mouth Ulcers"] },
];
const MEDICINE_CATEGORIES = [
  { icon: "Thermometer", name: "Pain & Fever Medicines" },
  { icon: "ShieldPlus", name: "Antibiotic Reference" },
  { icon: "Soup", name: "Digestive Medicines" },
  { icon: "Flower2", name: "Allergy Medicines" },
  { icon: "Pill", name: "Vitamins & Minerals" },
  { icon: "Wind", name: "Respiratory Medicines" },
  { icon: "BookOpen", name: "Other Commonly Referenced Medicines" },
];
const HOW_PRESENTED = [
  { icon: "BookOpen", title: "Quick Definitions", desc: "Short introductions help establish the topic." },
  { icon: "Brain", title: "Visual Explanations", desc: "Relevant anatomy and concept illustrations accompany the text." },
  { icon: "LayoutGrid", title: "Structured Sections", desc: "Information is separated into easy-to-scan categories." },
  { icon: "Lightbulb", title: "Important Concepts", desc: "Key learning points are visually highlighted." },
  { icon: "TriangleAlert", title: "Red Flags", desc: "Selected warning signs are clearly separated for educational awareness." },
  { icon: "Timer", title: "Quick Revision", desc: "Pages are designed so important information can be reviewed efficiently." },
];
const BILINGUAL_PAIRS = [
  ["Common Causes", "सामान्य कारण"],
  ["Assessment", "मूल्यांकन"],
  ["Red Flags", "चेतावनी संकेत"],
];
const WHO_FOR = [
  { emoji: "🎓", title: "Students", desc: "For supplementary revision and reference." },
  { emoji: "📚", title: "Healthcare Learners", desc: "For reviewing selected terminology and concepts." },
  { emoji: "📝", title: "Exam Revision", desc: "Useful as an additional visual revision resource alongside formal study material." },
  { emoji: "🧠", title: "Curious Learners", desc: "For general educational awareness of common health topics." },
];
const FAQS = [
  { q: "Is this a medical textbook?", a: "No. It is an illustrated supplementary reference and revision resource." },
  { q: "Does the guide provide prescriptions?", a: "No. The guides are not prescriptions and should not be used as personalized medical advice." },
  { q: "Are medicine dosages included?", a: "No dosage guidance is provided." },
  { q: "What format will I receive?", a: "The product is supplied as digital PDF reference material." },
  { q: "Can I use this instead of consulting a doctor?", a: "No. Medical concerns should be discussed with an appropriately qualified healthcare professional." },
  { q: "Does it cover both diseases and medicines?", a: "Yes. The bundle contains separate Disease and Medicine Reference Guides covering the topics specified in the product contents." },
  { q: "Can I share or resell the PDFs?", a: "The purchase is for personal use according to the product licence. Redistribution, reproduction or resale is not permitted except where applicable law allows otherwise." },
  { q: "Is the information guaranteed to be error-free?", a: "No educational resource should make that claim. The material is prepared for educational reference, but readers should verify clinically important information with current authoritative medical sources." },
];
const NAV_LINKS = [
  { label: "Samples", href: "#samples" },
  { label: "Pricing", href: "#pricing" },
  { label: "What's Inside", href: "#inside" },
  { label: "Topics", href: "#topics" },
  { label: "FAQ", href: "#faq" },
];

const Icon = ({ name, className }) => {
  const C = Lucide[name] || Lucide.Circle;
  return <C className={className} />;
};

/* ---------------- shared ui ---------------- */
export const Reveal = ({ children, delay = 0, className = "", y = 24 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Eyebrow = ({ children }) => <span className="mrg-eyebrow">{children}</span>;

export const SectionHead = ({ eyebrow, title, sub, center = true }) => (
  <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <h2 className="mrg-h-section mt-4">{title}</h2>
    {sub ? <p className="mt-4 text-base leading-relaxed text-mrg-slateink sm:text-lg">{sub}</p> : null}
  </div>
);

export const AnchorStrip = () => (
  <div className="border-b border-mrg-line bg-white">
    <div className="mrg-container-x hidden items-center justify-center gap-8 py-2.5 lg:flex">
      {NAV_LINKS.map((l) => (
        <a key={l.href} href={l.href} className="text-[13px] font-semibold text-mrg-slateink transition-colors hover:text-mrg-navy">{l.label}</a>
      ))}
      <BuyAnchorLink />
    </div>
  </div>
);

const BuyAnchorLink = () => {
  const { openBuy, price, total } = useMrgBuy();
  return (
    <button type="button" onClick={() => openBuy()} data-testid="mrg-anchor-buy" className="rounded-full bg-mrg-teal px-4 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-mrg-tealdark">
      Get Access · ₹{total}
    </button>
  );
};

export const AnnouncementBar = () => {
  const seconds = useOfferTimer(10);
  const { price, regularPrice } = useMrgBuy();
  return (
    <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white">
      <div className="mrg-container-x flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-[12px] font-medium tracking-wide sm:text-[13px]">
        <Lucide.Flame className="h-4 w-4 shrink-0 animate-pulse" />
        <span className="font-bold">
          Limited-time price: ₹{price}{" "}
          <span className="font-normal text-white/80 line-through">₹{regularPrice}</span>
        </span>
        <span className="hidden text-white/80 sm:inline">·</span>
        {seconds == null ? (
          <span className="font-semibold text-white/90">Selling fast — grab yours now</span>
        ) : (
          <span className="font-mono font-bold tabular-nums" data-testid="mrg-announcement-timer">
            Ends in {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
};

/* ---------------- countdown badge ---------------- */
export const CountdownBadge = ({ variant = "pill", className = "" }) => {
  const { price } = useMrgBuy();
  const seconds = useOfferTimer(10);
  const expired = seconds == null;
  const mm = String(Math.floor((seconds || 0) / 60)).padStart(2, "0");
  const ss = String((seconds || 0) % 60).padStart(2, "0");

  if (variant === "banner") {
    return (
      <div data-testid="mrg-countdown-banner" className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md ${className}`}>
        <Lucide.Flame className="h-4 w-4 animate-pulse" />
        {expired ? (
          <span>Limited-time price · selling fast</span>
        ) : (
          <>
            <span>Offer ends in</span>
            <span data-testid="mrg-countdown-timer" className="rounded-md bg-white/25 px-2 py-0.5 font-mono text-base tabular-nums tracking-wider">{mm}:{ss}</span>
          </>
        )}
      </div>
    );
  }
  return (
    <span data-testid="mrg-countdown-pill" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 ring-1 ring-orange-300 ${className}`}>
      <Lucide.Flame className="h-3.5 w-3.5" />
      {expired ? (
        <>Selling fast · ₹{price}</>
      ) : (
        <><span className="font-mono tabular-nums">{mm}:{ss}</span> left at ₹{price}</>
      )}
    </span>
  );
};

/* ---------------- hero ---------------- */
const HERO_STATS = [
  { icon: Lucide.Layers, n: "140+", l: "Topics" },
  { icon: Lucide.BookOpenCheck, n: "2", l: "Guides" },
  { icon: Lucide.Languages, n: "EN + HI", l: "Bilingual" },
  { icon: Lucide.GraduationCap, n: "PDF", l: "Digital" },
];

export const Hero = () => {
  const { openBuy, price, regularPrice, total } = useMrgBuy();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-gradient-to-b from-mrg-mist via-white to-white" />
        <div className="absolute -left-24 top-6 h-72 w-72 rounded-full bg-mrg-teal/15 blur-3xl" />
        <div className="absolute right-0 top-48 h-80 w-80 rounded-full bg-mrg-grape/10 blur-3xl" />
        <div className="absolute left-1/2 top-24 h-64 w-64 rounded-full bg-mrg-grassy/10 blur-3xl" />
      </div>

      <div className="mrg-container-x grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
        <div>
          <Reveal><Eyebrow>Illustrated • Structured • Quick Revision</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 font-display text-[2.5rem] font-extrabold leading-[1.03] text-mrg-navy sm:text-5xl md:text-[3.4rem]">
              Medical Topics,<br className="hidden sm:block" /> Made Easier to{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-mrg-teal to-mrg-grassy bg-clip-text text-transparent">Review.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none"><path d="M2 7C40 2 160 2 198 7" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" opacity="0.5" /></svg>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mrg-slateink sm:text-base">
              Explore <span className="font-bold text-mrg-navy">140+ Disease &amp; Medicine topics</span> through colourful, structured pages — clear sections with illustrations, icons and highlighted key points instead of long walls of text.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 flex flex-wrap gap-2">
              {HERO_CHIPS.map((c) => (
                <span key={c} className="mrg-chip"><Lucide.Check className="h-3.5 w-3.5 text-mrg-grassy" /> {c}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={() => openBuy()} data-testid="mrg-hero-buy" className="mrg-btn-primary text-base">
                Get the Complete Guide · ₹{total} <Lucide.ArrowRight className="h-5 w-5" />
              </button>
              <a href="#samples" className="mrg-btn-ghost">View Sample Pages <Lucide.ChevronDown className="h-4 w-4" /></a>
            </div>
            <div className="mt-4"><CountdownBadge variant="pill" /></div>
            <p className="mt-3 text-[13px] text-mrg-slateink">Digital educational content • Not a prescription • No dosage guidance</p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-8 grid max-w-md grid-cols-4 gap-3 border-t border-mrg-line pt-6">
              {HERO_STATS.map((s) => (
                <div key={s.l} className="text-center">
                  <s.icon className="mx-auto h-5 w-5 text-mrg-teal" />
                  <div className="mt-1.5 font-display text-lg font-extrabold leading-none text-mrg-navy">{s.n}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-mrg-slateink">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative">
          <div className="relative mx-auto flex max-w-md items-end justify-center">
            <div className="absolute -right-2 -top-4 z-30 flex items-center gap-2 rounded-full border border-mrg-line bg-white px-4 py-2 text-sm font-bold text-mrg-navy shadow-mrg-card">
              <Lucide.BookOpenCheck className="h-4 w-4 text-mrg-teal" /> 2 Illustrated Guides
            </div>
            <div className="mrg-float absolute -left-3 top-24 z-30 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-mrg-navy shadow-mrg-card" style={{ animationDelay: "0.4s" }}>
              <Lucide.Languages className="h-3.5 w-3.5 text-mrg-teal" /> English + Hindi
            </div>
            <div className="absolute -left-1 bottom-24 z-30 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-mrg-danger shadow-mrg-card">
              <Lucide.TriangleAlert className="h-3.5 w-3.5" /> Red Flags included
            </div>
            <img src={COVERS.medicine} alt="Medicines Reference Guide book cover" className="absolute right-0 z-10 w-[58%] translate-x-6 translate-y-2 rotate-6 drop-shadow-2xl" loading="lazy" />
            <img src={COVERS.disease} alt="Diseases Reference Guide book cover" className="mrg-float relative z-20 w-[64%] -rotate-3 drop-shadow-2xl" />
            <div className="absolute -bottom-2 right-0 z-30 rounded-xl border border-mrg-line bg-white px-4 py-2 shadow-mrg-card">
              <div className="text-[11px] font-bold uppercase tracking-widest text-mrg-teal">One-time · Digital</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-sm font-bold text-mrg-slateink/60 line-through">₹{regularPrice}</span>
                <span className="font-display text-xl font-extrabold text-mrg-navy">₹{price}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- flowing sample rows (disease row + medicine row) ---------------- */
const FlowRow = ({ label, title, images, anim, testid }) => (
  <div data-testid={testid}>
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="mrg-eyebrow">{label}</span>
      <span className="hidden text-sm font-semibold text-mrg-slateink sm:inline">{title}</span>
    </div>
    <div className="mrg-flow-mask-x py-2">
      <div className={`mrg-flow-row ${anim}`}>
        {[...images, ...images].map((s, i) => (
          <figure key={`${s.title}-${i}`} className="w-56 shrink-0 sm:w-72" style={{ pointerEvents: "none" }}>
            <img
              src={s.img}
              alt={`${title} sample page`}
              className="w-full select-none rounded-xl border border-mrg-line shadow-mrg-soft"
              loading="lazy"
              draggable="false"
            />
            <figcaption className="mt-2 text-center text-[13px] font-semibold text-mrg-slateink">
              {s.title} <span className="font-normal text-mrg-slateink/70">· {s.hi}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </div>
);

export const SamplePages = () => (
  <section id="samples" className="border-y border-mrg-line bg-mrg-mist py-16 md:py-20 scroll-mt-20">
    <div className="mrg-container-x">
      <Reveal>
        <SectionHead
          eyebrow="Preview"
          title="Real Pages, Flowing Live"
          sub="Section by section — the Diseases Reference pages first, then the Medicines Reference. Exactly how the guides look inside."
        />
      </Reveal>
    </div>
    <Reveal delay={0.08}>
      <FlowRow
        label="Section 01 · Disease Guide"
        title="Diseases & Clinical Conditions"
        images={DISEASE_SAMPLES}
        anim="mrg-flow-left"
        testid="mrg-flow-disease"
      />
      <FlowRow
        label="Section 02 · Medicine Guide"
        title="Medicines Reference"
        images={MEDICINE_SAMPLES}
        anim="mrg-flow-right"
        testid="mrg-flow-medicine"
      />
    </Reveal>
    <div className="mrg-container-x">
      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-mrg-slateink">
        Sample pages demonstrate the design, structure and type of educational information included in the guides. The complete guides are delivered as PDFs after purchase.
      </p>
    </div>
  </section>
);

/* ---------------- what's inside highlights ---------------- */
export const InsideHighlights = () => {
  const items = [
    { icon: "BookOpenText", t: "2 Illustrated Guides", d: "Disease + Medicine reference PDFs bundled together." },
    { icon: "LayoutGrid", t: "140+ Topics", d: "Diseases & medicines organised chapter-by-chapter." },
    { icon: "Languages", t: "English + Hindi", d: "Bilingual explanations included where provided." },
    { icon: "Timer", t: "Quick Revision", d: "Scannable, sectioned layout built for fast review." },
    { icon: "TriangleAlert", t: "Red Flags", d: "Key warning signs visually separated for awareness.", danger: true },
    { icon: "Smartphone", t: "Digital PDF Access", d: "Read on your phone, tablet or laptop, anytime." },
  ];
  return (
    <section id="inside" className="mrg-container-x py-16 md:py-20 scroll-mt-20">
      <Reveal><SectionHead eyebrow="What's Inside" title="Everything in the Bundle, at a Glance" sub="A quick overview of what makes these guides easy to study and revise — no repeated pages, just the essentials." /></Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={(i % 3) * 0.06}>
            <div className={`mrg-card-soft flex h-full items-start gap-4 p-6 transition-all hover:-translate-y-1 hover:shadow-mrg-card ${it.danger ? "border-mrg-danger/25" : ""}`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${it.danger ? "bg-mrg-danger/10 text-mrg-danger" : "bg-mrg-teal/10 text-mrg-teal"}`}><Icon name={it.icon} className="h-6 w-6" /></span>
              <div>
                <h3 className="font-display text-lg font-extrabold text-mrg-navy">{it.t}</h3>
                <p className="mt-1 text-[15px] text-mrg-slateink">{it.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ---------------- why created (before/after) ---------------- */
export const WhyCreated = () => {
  const before = [
    { icon: "AlignLeft", t: "Long walls of dense text" },
    { icon: "Shuffle", t: "Scattered, hard-to-find information" },
    { icon: "EyeOff", t: "Few visual cues or diagrams" },
    { icon: "Hourglass", t: "Slow, tiring revision sessions" },
  ];
  const after = [
    { icon: "LayoutGrid", t: "Clean, structured sections" },
    { icon: "Image", t: "Illustrated concepts & diagrams" },
    { icon: "Highlighter", t: "Key points visually highlighted" },
    { icon: "Zap", t: "Fast, quick-reference layout" },
  ];
  return (
    <section className="border-y border-mrg-line bg-gradient-to-b from-white to-mrg-mist">
      <div className="mrg-container-x py-16 md:py-20">
        <Reveal><SectionHead eyebrow="The Why" title="Medical Info Shouldn't Be This Hard to Revise"
          sub="Definitions, causes, symptoms, assessment points and warning signs are usually buried in walls of text. We reorganise selected information into visual, structured pages that are far easier to browse and remember." /></Reveal>

        <div className="relative mx-auto mt-12 grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="relative h-full overflow-hidden rounded-3xl border border-rose-200 bg-rose-50/60 p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-500"><Lucide.FileText className="h-5 w-5" /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400">The old way</p>
                  <h3 className="font-display text-xl font-extrabold text-mrg-navy">Traditional Notes</h3>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {before.map((p) => (
                  <li key={p.t} className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5 text-[15px] text-slate-600">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-500"><Icon name={p.icon} className="h-4 w-4" /></span>
                    {p.t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <div className="relative h-full overflow-hidden rounded-3xl border-2 border-mrg-teal/40 bg-gradient-to-br from-mrg-teal/10 to-mrg-grassy/10 p-7 shadow-mrg-glow">
              <span className="absolute right-5 top-5 rounded-full bg-mrg-teal px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Recommended</span>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mrg-teal text-white"><Lucide.Sparkles className="h-5 w-5" /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-mrg-tealdark">The visual way</p>
                  <h3 className="font-display text-xl font-extrabold text-mrg-navy">Medical Reference Guide</h3>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {after.map((p) => (
                  <li key={p.t} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-[15px] font-semibold text-mrg-navy shadow-mrg-soft">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mrg-teal/15 text-mrg-teal"><Icon name={p.icon} className="h-4 w-4" /></span>
                    {p.t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <span className="grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-mrg-navy font-display text-sm font-extrabold text-white shadow-mrg-card">VS</span>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-mrg-slateink">A supplementary reference designed to sit alongside your textbooks and course material — not to replace them.</p>
      </div>
    </section>
  );
};

/* ---------------- bundle cards ---------------- */
export const BundleCards = () => (
  <section id="bundle" className="border-y border-mrg-line bg-mrg-mist scroll-mt-20">
    <div className="mrg-container-x py-16 md:py-20">
      <Reveal><SectionHead eyebrow="What's Inside" title="Explore the Complete Reference Bundle" /></Reveal>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <article className="mrg-card-soft h-full overflow-hidden">
            <div className="grid place-items-center bg-gradient-to-br from-mrg-mist to-white p-6" style={{ minHeight: "260px" }}><img src={COVERS.disease} alt="Diseases Reference Guide book cover" className="max-h-64 w-auto drop-shadow-2xl" loading="lazy" /></div>
            <div className="p-6">
              <span className="mrg-eyebrow">Guide 01</span>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-mrg-navy">Illustrated Disease Reference Guide</h3>
              <p className="mt-2 text-[15px] text-mrg-slateink">A structured visual guide covering common disease conditions and clinical presentations for educational review.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {DISEASE_SECTIONS.map((s) => (<span key={s} className="flex items-center gap-2 text-[13px] text-mrg-navy"><Lucide.Check className="h-4 w-4 shrink-0 text-mrg-grassy" />{s}</span>))}
              </div>
              <p className="mt-4 text-xs text-mrg-slateink">Not every topic contains every section — pages show only what's appropriate to that topic.</p>
            </div>
          </article>
        </Reveal>
        <Reveal delay={0.1}>
          <article className="mrg-card-soft h-full overflow-hidden">
            <div className="grid place-items-center bg-gradient-to-br from-mrg-mist to-white p-6" style={{ minHeight: "260px" }}><img src={COVERS.medicine} alt="Medicines Reference Guide book cover" className="max-h-64 w-auto drop-shadow-2xl" loading="lazy" /></div>
            <div className="p-6">
              <span className="mrg-eyebrow">Guide 02</span>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-mrg-navy">Illustrated Medicine Reference Guide</h3>
              <p className="mt-2 text-[15px] text-mrg-slateink">Review important medicine information through clearly divided visual sections.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {MEDICINE_SECTIONS.map((s) => (<span key={s} className="flex items-center gap-2 text-[13px] text-mrg-navy"><Lucide.Check className="h-4 w-4 shrink-0 text-mrg-grassy" />{s}</span>))}
              </div>
              <p className="mt-4 rounded-lg bg-mrg-mist px-3 py-2 text-xs font-semibold text-mrg-slateink">Medicine information is educational only and is not prescribing guidance.</p>
            </div>
          </article>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ---------------- disease topics ---------------- */
export const DiseaseTopics = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? DISEASE_CATEGORIES : DISEASE_CATEGORIES.slice(0, 4);
  return (
    <section id="topics" className="mrg-container-x py-16 md:py-20 scroll-mt-20">
      <Reveal><SectionHead eyebrow="Disease Guide" title="Topics You'll Explore" sub="A structured collection of disease conditions and common clinical presentations, grouped into chapters." /></Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 0.06}>
            <div className="mrg-card-soft h-full p-6 transition-all hover:-translate-y-1 hover:shadow-mrg-card">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mrg-teal/10 text-mrg-teal"><Icon name={c.icon} className="h-5 w-5" /></span>
                <h3 className="font-display text-lg font-extrabold text-mrg-navy">{c.name}</h3>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {c.topics.map((t) => (<li key={t} className="rounded-full bg-mrg-mist px-3 py-1 text-[13px] font-medium text-mrg-slateink">{t}</li>))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 text-center">
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mrg-btn-ghost">
          {expanded ? (<>Show Less <Lucide.Minus className="h-4 w-4" /></>) : (<>View More Topics <Lucide.Plus className="h-4 w-4" /></>)}
        </button>
        <p className="mx-auto mt-5 max-w-xl text-sm text-mrg-slateink">Exact topic coverage may vary by edition. Refer to the included contents page for the complete list.</p>
      </div>
    </section>
  );
};

/* ---------------- medicine categories ---------------- */
export const MedicineCategories = () => (
  <section className="border-y border-mrg-line bg-mrg-mist">
    <div className="mrg-container-x py-16 md:py-20">
      <Reveal><SectionHead eyebrow="Medicine Guide" title="Medicine Information at a Glance" sub="Medicines are organised into clear reference categories for easy browsing." /></Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MEDICINE_CATEGORIES.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 0.06}>
            <div className="flex items-center gap-4 rounded-2xl border border-mrg-line bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-mrg-card">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mrg-grape/10 text-mrg-grape"><Icon name={c.icon} className="h-6 w-6" /></span>
              <span className="font-display text-[15px] font-bold text-mrg-navy">{c.name}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-center text-sm font-semibold text-mrg-slateink">Each medicine page is designed for educational review — not self-medication.</p>
    </div>
  </section>
);

/* ---------------- how presented ---------------- */
export const HowPresented = () => (
  <section className="mrg-container-x py-16 md:py-20">
    <Reveal><SectionHead eyebrow="The Format" title="Built for Visual Revision" /></Reveal>
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {HOW_PRESENTED.map((f, i) => {
        const danger = f.icon === "TriangleAlert";
        return (
          <Reveal key={f.title} delay={(i % 3) * 0.06}>
            <div className={`mrg-card-soft h-full p-6 transition-all hover:-translate-y-1 hover:shadow-mrg-card ${danger ? "border-mrg-danger/25 bg-mrg-danger/5" : ""}`}>
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${danger ? "bg-mrg-danger/10 text-mrg-danger" : "bg-mrg-teal/10 text-mrg-teal"}`}><Icon name={f.icon} className="h-6 w-6" /></span>
              <h3 className="mt-4 font-display text-lg font-extrabold text-mrg-navy">{f.title}</h3>
              <p className="mt-2 text-[15px] text-mrg-slateink">{f.desc}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  </section>
);

/* ---------------- bilingual ---------------- */
export const Bilingual = () => (
  <section className="border-y border-mrg-line bg-mrg-mist">
    <div className="mrg-container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
      <Reveal className="order-2 md:order-1">
        <Eyebrow>Bilingual</Eyebrow>
        <h2 className="mrg-h-section mt-4">Easier-to-Follow Bilingual Explanations</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-mrg-slateink">Selected content is presented with English and Hindi explanations, helping readers review terminology while understanding important concepts more comfortably.</p>
        <div className="mt-6 space-y-3">
          {BILINGUAL_PAIRS.map(([en, hi]) => (
            <div key={en} className="flex items-center gap-3 rounded-xl border border-mrg-line bg-white px-4 py-3">
              <Lucide.Globe2 className="h-5 w-5 text-mrg-teal" />
              <span className="font-bold text-mrg-navy">{en}</span>
              <span className="text-mrg-slateink">|</span>
              <span className="font-semibold text-mrg-slateink">{hi}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-mrg-slateink">Bilingual content is included where provided in the guides; not every line or page is bilingual.</p>
      </Reveal>
      <Reveal delay={0.1} className="order-1 md:order-2">
        <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-mrg-line bg-white shadow-mrg-card">
          <img src={BILINGUAL_IMG} alt="Fatigue & Weakness bilingual English and Hindi reference page" className="w-full" loading="lazy" />
        </div>
      </Reveal>
    </div>
  </section>
);

/* ---------------- who for ---------------- */
export const WhoFor = () => (
  <section className="mrg-container-x py-16 md:py-20">
    <Reveal><SectionHead eyebrow="Audience" title="Designed for Educational Reference" /></Reveal>
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {WHO_FOR.map((w, i) => (
        <Reveal key={w.title} delay={i * 0.06}>
          <div className="mrg-card-soft h-full p-6 text-center transition-all hover:-translate-y-1 hover:shadow-mrg-card">
            <div className="text-3xl">{w.emoji}</div>
            <h3 className="mt-3 font-display text-lg font-extrabold text-mrg-navy">{w.title}</h3>
            <p className="mt-2 text-sm text-mrg-slateink">{w.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
    <p className="mx-auto mt-8 max-w-3xl rounded-2xl border border-mrg-line bg-mrg-mist px-5 py-4 text-center text-sm font-semibold text-mrg-navy">This guide does not replace approved textbooks, course material, clinical training or professional medical advice.</p>
  </section>
);

/* ---------------- what you receive ---------------- */
export const WhatYouReceive = () => {
  const disease = ["Structured disease / reference topics", "Common causes and clinical features", "Assessment concepts", "Important points", "Red flags", "Quick-revision format"];
  const medicine = ["Medicine classes", "Main uses", "Common side effects", "Important warnings", "Precautions", "Seek-medical-help information", "Key reference points"];
  return (
    <section className="border-y border-mrg-line bg-mrg-mist">
      <div className="mrg-container-x py-16 md:py-20">
        <Reveal><SectionHead eyebrow="Included" title="What's Included" /></Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="mrg-card-soft h-full p-6">
              <img src={COVERS.disease} alt="Diseases Reference Guide book cover" className="mx-auto mb-5 max-h-56 w-auto drop-shadow-xl" loading="lazy" />
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-mrg-teal/10 text-mrg-teal"><Lucide.HeartPulse className="h-5 w-5" /></span><h3 className="font-display text-xl font-extrabold text-mrg-navy">Disease Reference Guide</h3></div>
              <p className="mt-2 text-sm font-semibold text-mrg-tealdark">Illustrated PDF</p>
              <ul className="mt-4 space-y-2.5">{disease.map((d) => (<li key={d} className="flex items-start gap-2.5 text-[15px] text-mrg-slateink"><Lucide.Check className="mt-0.5 h-4 w-4 shrink-0 text-mrg-grassy" />{d}</li>))}</ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mrg-card-soft h-full p-6">
              <img src={COVERS.medicine} alt="Medicines Reference Guide book cover" className="mx-auto mb-5 max-h-56 w-auto drop-shadow-xl" loading="lazy" />
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-mrg-grape/10 text-mrg-grape"><Lucide.Pill className="h-5 w-5" /></span><h3 className="font-display text-xl font-extrabold text-mrg-navy">Medicine Reference Guide</h3></div>
              <p className="mt-2 text-sm font-semibold text-mrg-tealdark">Illustrated PDF</p>
              <ul className="mt-4 space-y-2.5">{medicine.map((d) => (<li key={d} className="flex items-start gap-2.5 text-[15px] text-mrg-slateink"><Lucide.Check className="mt-0.5 h-4 w-4 shrink-0 text-mrg-grassy" />{d}</li>))}</ul>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-3 rounded-2xl border-2 border-mrg-teal/30 bg-mrg-teal/5 px-6 py-4 text-center">
            <Lucide.Layers className="h-6 w-6 text-mrg-teal" />
            <span className="font-display text-lg font-extrabold text-mrg-navy">140+ Disease &amp; Medicine Topics Combined</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- disclaimer ---------------- */
export const DisclaimerCard = () => (
  <section className="mrg-container-x py-14">
    <Reveal>
      <div className="mx-auto max-w-4xl rounded-2xl border-2 border-sky-200 bg-sky-50 p-7 md:p-9">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-700"><Lucide.Info className="h-6 w-6" /></span>
          <h3 className="font-display text-2xl font-extrabold text-mrg-navy">Educational Reference Only</h3>
        </div>
        <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-slate-600">
          <p>The Medical Reference Guide is intended for education, study, revision and general awareness only. It is <strong className="text-mrg-navy">not medical advice, diagnosis, treatment guidance or a prescription</strong>.</p>
          <p>Medicine information should not be used to start, stop or change any medicine without advice from an appropriately qualified healthcare professional. <strong className="text-mrg-navy">No dosage guidance is provided.</strong></p>
          <p>Medical information changes over time. Readers should verify important information using current authoritative sources and seek professional medical advice when appropriate.</p>
        </div>
      </div>
    </Reveal>
  </section>
);

/* ---------------- access steps ---------------- */
export const AccessSteps = () => {
  const steps = [
    { icon: "CreditCard", title: "Complete Your Purchase", desc: "Pay securely through Razorpay checkout." },
    { icon: "ShieldCheck", title: "Payment Verified", desc: "Your payment is confirmed on our server before access is granted." },
    { icon: "BookOpenText", title: "Open Your Guides", desc: "Access the digital PDF reference material on a compatible device." },
  ];
  return (
    <section className="border-y border-mrg-line bg-mrg-mist">
      <div className="mrg-container-x py-16 md:py-20">
        <Reveal><SectionHead eyebrow="Access" title="Simple Digital Access" /></Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="mrg-card-soft h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-mrg-navy text-white"><Icon name={s.icon} className="h-6 w-6" /></span>
                  <span className="font-display text-4xl font-extrabold text-mrg-line">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-extrabold text-mrg-navy">{s.title}</h3>
                <p className="mt-2 text-[15px] text-mrg-slateink">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- pricing ---------------- */
export const Pricing = () => {
  const { openBuy, price, regularPrice, addOns, selectedAddOns, toggleAddOn, addOnTotal, total, highlight, comboOn, toggleCombo, combo } = useMrgBuy();
  const includes = [
    "Illustrated Disease Reference Guide (PDF)",
    "Illustrated Medicine Reference Guide (PDF)",
    "140+ Disease & Medicine topics combined",
    "Structured, colourful quick-revision format",
    "English + Hindi content where included",
    "Digital access after successful payment",
  ];
  const selCount = selectedAddOns.length;
  return (
    <section id="pricing" className="mrg-container-x py-16 md:py-20 scroll-mt-20">
      <Reveal><SectionHead eyebrow="Pricing" title="Get the Medical Reference Guide Bundle" /></Reveal>
      <Reveal delay={0.08}>
        <div className="mx-auto mt-10 max-w-lg overflow-hidden rounded-3xl border border-mrg-line bg-white shadow-mrg-card">
          <div className="bg-gradient-to-br from-mrg-navy to-mrg-tealdark px-8 py-8 text-center text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Complete Bundle • Digital</p>
            <div className="mt-3 flex items-end justify-center gap-2">
              <span className="pb-2 font-display text-2xl font-bold text-white/50 line-through">₹{regularPrice}</span>
              <span data-testid="mrg-pricing-price" className="font-display text-5xl font-extrabold">₹{price}</span>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-300">
              Save ₹{regularPrice - price} · Limited-time price
            </p>
            <div className="mt-4 flex justify-center">
              <CountdownBadge variant="banner" className="w-full max-w-xs" />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <ul className="space-y-2.5">
              {includes.map((it) => (
                <li key={it} className="flex items-start gap-3 text-[15px] text-mrg-navy"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mrg-teal/15 text-mrg-teal"><Lucide.Check className="h-3.5 w-3.5" /></span>{it}</li>
              ))}
            </ul>

            <div className={`mt-6 rounded-2xl border p-4 transition-all duration-500 ${highlight ? "border-mrg-teal bg-mrg-teal/5 ring-4 ring-mrg-teal/20" : "border-mrg-line bg-mrg-mist/70"}`} data-testid="mrg-addons-panel">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[13px] font-extrabold uppercase tracking-wider text-mrg-navy" data-testid="mrg-addons-title">Add-On Offers · Optional</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${selCount > 0 ? "bg-mrg-teal text-white" : "border border-mrg-line bg-white text-mrg-slateink"}`} data-testid="mrg-addons-count">
                  {selCount > 0 ? `${selCount} selected` : "None selected"}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {addOns.map((a) => {
                  const active = selectedAddOns.includes(a.slug);
                  const recommended = a.slug === "ecg-guide" || a.slug === "emergency-guide";
                  return (
                    <label key={a.slug} data-testid={`mrg-addon-${a.slug}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all ${comboOn ? "pointer-events-none opacity-50" : ""} ${active || comboOn ? "border-mrg-teal bg-mrg-teal/10 ring-1 ring-mrg-teal/40" : recommended ? "border-mrg-teal/40 bg-white hover:border-mrg-teal" : "border-mrg-line bg-white hover:border-mrg-teal/50"}`}>
                      <input type="checkbox" className="sr-only" checked={active || comboOn} onChange={() => toggleAddOn(a.slug)} data-testid={`mrg-addon-check-${a.slug}`} />
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${active || comboOn ? "border-mrg-teal bg-mrg-teal text-white" : "border-mrg-line bg-white text-transparent"}`}><Lucide.Check className="h-3.5 w-3.5" /></span>
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[14px] font-bold text-mrg-navy">{a.title}</span>
                        {!active && !comboOn && recommended && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-mrg-teal px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"><Lucide.Star className="h-2.5 w-2.5" /> Recommended</span>
                        )}
                      </span>
                      <span className="font-display text-[14px] font-extrabold text-mrg-teal">₹{a.price}</span>
                    </label>
                  );
                })}

                <label data-testid="mrg-addon-combo" className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-3.5 py-3 transition-all ${comboOn ? "border-mrg-teal bg-mrg-teal/10 ring-2 ring-mrg-teal/40" : "border-mrg-grape/50 bg-mrg-grape/5 hover:border-mrg-grape"}`}>
                  <input type="checkbox" className="sr-only" checked={comboOn} onChange={toggleCombo} data-testid="mrg-addon-check-combo" />
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${comboOn ? "border-mrg-teal bg-mrg-teal text-white" : "border-mrg-grape/60 bg-white text-transparent"}`}><Lucide.Check className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14px] font-extrabold text-mrg-navy">All 5 Add-Ons Combo</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-mrg-grape px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"><Lucide.Zap className="h-2.5 w-2.5" /> Best value</span>
                    </span>
                    <span className="mt-0.5 block text-[12px] text-mrg-slateink">One tick — every extra guide · Save ₹{(addOns.reduce((s, a) => s + a.price, 0) - combo.price).toLocaleString("en-IN")}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[11px] font-semibold text-mrg-slateink line-through">₹{addOns.reduce((s, a) => s + a.price, 0).toLocaleString("en-IN")}</span>
                    <span className="font-display text-[15px] font-extrabold text-mrg-grape">₹{combo.price}</span>
                  </span>
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-mrg-line bg-white px-3.5 py-2.5" data-testid="mrg-addons-total">
                {comboOn ? (
                  <span className="text-[13px] font-semibold text-mrg-navy">Bundle ₹{price} <span className="text-mrg-slateink">+ Combo</span> ₹{combo.price}</span>
                ) : selCount > 0 ? (
                  <span className="text-[13px] font-semibold text-mrg-navy">Bundle ₹{price} <span className="text-mrg-slateink">+ Add-ons</span> ₹{addOnTotal}</span>
                ) : (
                  <span className="text-[13px] text-mrg-slateink">Tick any extras above — pay once for everything</span>
                )}
                <span className="font-display text-lg font-extrabold text-mrg-teal">₹{total}</span>
              </div>
            </div>

            <button type="button" onClick={() => openBuy(true)} data-testid="mrg-pricing-buy" className="mrg-btn-primary mt-6 w-full text-lg">
              Get the Order — ₹{total} <Lucide.ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-mrg-slateink"><Lucide.ShieldCheck className="h-3.5 w-3.5 text-mrg-teal" /> One-time purchase • Digital product • Educational reference only</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

/* ---------------- faq ---------------- */
export const Faq = () => (
  <section id="faq" className="border-t border-mrg-line bg-mrg-mist scroll-mt-20">
    <div className="mrg-container-x py-16 md:py-20">
      <Reveal><SectionHead eyebrow="FAQ" title="Good to Know" /></Reveal>
      <Reveal delay={0.06}>
        <div className="mx-auto mt-9 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`mrg-item-${i}`} className="overflow-hidden rounded-2xl border border-mrg-line bg-white px-5">
                <AccordionTrigger className="py-5 text-left font-display text-[15px] font-bold text-mrg-navy hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-mrg-slateink">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ---------------- final cta ---------------- */
export const FinalCta = () => {
  const { openBuy, price, total } = useMrgBuy();
  return (
    <section className="relative overflow-hidden bg-mrg-navy">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-mrg-teal/30 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-mrg-grape/20 blur-3xl" />
      </div>
      <div className="mrg-container-x relative py-20 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-mrg-teal">Illustrated • Structured • Educational</span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">Make Medical Revision More Visual.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/70">Explore disease and medicine topics through colourful reference pages designed to make information easier to browse and review.</p>
          <button type="button" onClick={() => openBuy(true)} data-testid="mrg-final-buy" className="mrg-btn-primary mt-8">Get the Medical Reference Guide · ₹{total} <Lucide.ArrowRight className="h-5 w-5" /></button>
          <p className="mt-4 text-sm text-white/60">Disease Guide + Medicine Guide • Digital PDFs • ₹{total}</p>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- sticky mobile cta ---------------- */
export const StickyCta = () => {
  const { openBuy, price, total } = useMrgBuy();
  const [show, setShow] = useState(false);
  const seconds = useOfferTimer(10);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-mrg-line bg-white/95 p-3 backdrop-blur-md transition-transform sm:hidden ${show ? "translate-y-0" : "translate-y-full"}`}>
      {seconds != null && (
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-orange-600">
          <Lucide.Flame className="h-3.5 w-3.5" />
          Offer ends in <span className="font-mono tabular-nums">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
        </div>
      )}
      <button type="button" onClick={() => openBuy()} data-testid="mrg-sticky-buy" className="mrg-btn-primary w-full">Get the Complete Guide · ₹{total}</button>
    </div>
  );
};

import { useEffect, useState } from "react";
import {
  ArrowUpRight, ArrowLeft, ArrowRight, Check, X, Sparkles, CreditCard, Mail, Download, ShieldCheck,
  Timer, Zap, Gift, FileSpreadsheet, Lock, Smartphone, Infinity as InfinityIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { useOfferTimer } from "../../lib/offerTimer";
import { useBbsBuy, addOnPrice, BBS_TIMER_KEY } from "./LandingContext";

/* ---------------- content ---------------- */
const SHOTS = "/assets/bookkeeping";
const DASHBOARDS = [
  { name: "Setup", desc: "Set your currency, categories & profit goals in one click.", img: `${SHOTS}/setup.webp` },
  { name: "Income", desc: "Log every income source with tax, fees & net amount.", img: `${SHOTS}/income.webp` },
  { name: "Expenses", desc: "Track all spending with categories, accounts & remarks.", img: `${SHOTS}/expenses.webp` },
  { name: "Monthly", desc: "A full monthly overview with breakdowns & top sources.", img: `${SHOTS}/monthly.webp` },
  { name: "Annual", desc: "Yearly income, expenses, profit margin & goal progress.", img: `${SHOTS}/annual.webp` },
  { name: "5-Year", desc: "See five years of growth side by side, automatically.", img: `${SHOTS}/fiveyear.webp` },
  { name: "Comparison", desc: "Compare any three date ranges across your business.", img: `${SHOTS}/comparison.webp` },
  { name: "Custom", desc: "Build your own dashboard for any period you choose.", img: `${SHOTS}/custom.webp` },
  { name: "Balance", desc: "A clean balance sheet of assets over five years.", img: `${SHOTS}/balance.webp` },
  { name: "Sales Tax", desc: "Tax collected vs paid, tracked month by month.", img: `${SHOTS}/salestax.webp` },
];
const MARQUEE = ["PROFIT & LOSS", "MONTHLY DASHBOARDS", "AUTO-CALCULATIONS", "TAX SUMMARY", "INCOME & EXPENSES", "QUARTERLY REPORTS", "NO SUBSCRIPTIONS", "ANNUAL OVERVIEW"];
const PROBLEMS = [
  "Paying ₹500–₹2000 every month for accounting software you barely use.",
  "Copy-pasting numbers between apps and still not knowing your real profit.",
  "Confusing dashboards, hidden features and steep learning curves.",
  "No clear picture of taxes, expenses or where the money actually goes.",
];
const COMPARE = [
  ["Numbers scattered across notebooks, WhatsApp & bank apps", "Every rupee in one clean file — income, expenses, taxes"],
  ["You guess your profit at the end of the month", "Profit & loss calculates itself the moment you type"],
  ["Tax time = panic, receipts hunting & late nights", "Sales-tax summary ready month by month"],
  ["₹500–₹2000/month on software you barely use", "One-time payment — yours for life, no subscription"],
  ["No idea which month or source makes you money", "10 dashboards with graphs show exactly what's working"],
  ["Decisions made on gut feeling", "Decisions made on real numbers — monthly, yearly, 5-year"],
];
const INCLUDES = [
  "Income & expense tracker",
  "Auto profit & loss statement",
  "Monthly sales dashboard",
  "Quarterly & annual dashboards",
  "Tax summary calculator",
  "Ready-made graphs & charts",
  "Works in Excel & Google Sheets",
  "Fully editable · lifetime updates",
];
const ADDON_ITEMS = [
  ["📊", "Lead Tracker Template (Sheets & Excel)"],
  ["💰", "Word, PowerPoint & Power BI Templates + Bookkeeping & Habit Tracker Sheet"],
  ["🤖", "3,200+ AI & ChatGPT Prompts for Business"],
  ["✉️", "1,000+ Ready-to-Use Email Templates"],
  ["🎥", "1,600+ Business & Reel Ideas"],
];
const NAV_LINKS = [
  { label: "Inside", href: "#inside" },
  { label: "Buy vs Don't", href: "#compare" },
  { label: "Pricing", href: "#bbs-pricing" },
  { label: "FAQ", href: "#faq" },
];

const faqs = (price, addOn) => [
  ["Do I need any special software?", "No. It's a spreadsheet that works in Google Sheets and Microsoft Excel. If you can open a spreadsheet, you can use this."],
  ["Is it really fully editable?", "Yes. Change categories, colours, labels and formulas however you like. It's your copy forever."],
  ["How do I receive the file after buying?", "The instant your payment succeeds your download page opens on screen and the same access links are emailed to you — with your Google Sheets & Excel links plus a video tutorial."],
  ["Is this a one-time payment?", `Absolutely. Pay ₹${price} once via Razorpay and it's yours for life. No subscriptions, no recurring charges.`],
  ["Will my numbers calculate automatically?", "Yes. Just enter your income and expenses — profit & loss, taxes and every dashboard update themselves with graphs."],
  ["What is the Productivity & Execution Bundle?", `An optional add-on for ₹${addOn}: a lead tracker, Word/PowerPoint/Power BI templates, a habit tracker, 3,200+ AI prompts, 1,000+ email templates and 1,600+ business & reel ideas. It's only available together with this sheet, on this page.`],
  ["Can I pay with UPI?", "Yes — UPI, cards, netbanking and wallets are all supported through Razorpay's secure checkout."],
];

const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ---------------- shared ---------------- */
export const Reveal = ({ children, delay = 0, className = "", y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SectionLabel = ({ num, children }) => (
  <div className="bbs-num mb-3 text-center">{`[ ${num} ] — ${children}`}</div>
);

/** Countdown text — each instance ticks on its own so the page itself never re-renders every second. */
const Countdown = ({ className = "", testId, prefix = "", expiredText = "Limited-time price" }) => {
  const remaining = useOfferTimer(10, BBS_TIMER_KEY);
  return (
    <span className={className} data-testid={testId}>
      {remaining != null ? `${prefix}${fmtTime(remaining)}` : expiredText}
    </span>
  );
};

/* ---------------- urgency bar ---------------- */
export const UrgencyBar = () => {
  const { price, regularPrice } = useBbsBuy();
  return (
    <div className="bg-volt" data-testid="bbs-urgency-bar">
      <div className="bbs-container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-900">
        <span>Launch offer · ₹{price} <span className="font-semibold line-through opacity-60">₹{regularPrice}</span></span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-0.5 text-volt">
          <Timer className="h-3 w-3" /> <Countdown testId="bbs-urgency-timer" prefix="Ends in " expiredText="Ending soon" />
        </span>
      </div>
    </div>
  );
};

export const AnchorStrip = () => (
  <div className="border-b border-neutral-300 bg-white/70 backdrop-blur-sm">
    <div className="bbs-container hidden items-center justify-center gap-8 py-2.5 lg:flex">
      {NAV_LINKS.map((l) => (
        <a key={l.href} href={l.href} className="bbs-num transition-colors hover:text-neutral-900">{l.label}</a>
      ))}
      <BuyAnchorLink />
    </div>
  </div>
);

const BuyAnchorLink = () => {
  const { openBuy, price } = useBbsBuy();
  return (
    <button type="button" onClick={() => openBuy(true)} data-testid="bbs-anchor-buy" className="bbs-btn !px-4 !py-1.5 !text-[13px]">
      Buy · ₹{price}
    </button>
  );
};

export const Marquee = () => (
  <div className="overflow-hidden border-y border-neutral-300 bg-ink py-2.5">
    <div className="bbs-marquee">
      {[...MARQUEE, ...MARQUEE].map((t, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-volt">
          {t}<span className="text-neutral-600">/</span>
        </span>
      ))}
    </div>
  </div>
);

/* ---------------- hero (no entrance animation → paints instantly) ---------------- */
export const Hero = () => {
  const { openBuy, price } = useBbsBuy();
  return (
    <section className="bbs-container relative pb-12 pt-10 md:pb-16 md:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="bbs-tag"><Sparkles className="h-3.5 w-3.5" /> One Excel file · No software · Lifetime</span>
          <h1 className="bbs-h mt-5 text-[2.6rem] sm:text-6xl lg:text-[4.1rem]">
            The last<br />
            <span className="bg-volt px-2">spreadsheet</span><br />
            you&apos;ll ever need.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-600 sm:text-base">
            Track income, expenses, profit &amp; loss, taxes and monthly, quarterly &amp; annual dashboards — all automatically, with clean graphs. Works in Excel or Google Sheets.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={() => openBuy()} data-testid="bbs-hero-buy" className="bbs-btn text-base">
              Get lifetime access · ₹{price} <ArrowUpRight className="h-5 w-5" />
            </button>
            <a href="#inside" className="bbs-btn-ghost">See inside the sheet</a>
          </div>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-700">
            <Timer className="h-3.5 w-3.5" /> <Countdown className="text-red-600" testId="bbs-hero-timer" prefix="Launch price ends in " expiredText="Launch price — ending soon" />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-semibold text-neutral-600">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-neutral-900" /> Fully editable</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-neutral-900" /> Auto-calculated</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-neutral-900" /> Instant download</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-neutral-900" /> UPI accepted</span>
          </div>
        </div>

        <div className="relative">
          <div className="bbs-card rotate-1 p-3 transition-transform hover:rotate-0">
            <img
              src={`${SHOTS}/monthly.webp`}
              alt="Monthly dashboard of the bookkeeping sheet"
              width="1217"
              height="552"
              className="h-auto w-full rounded-lg"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable="false"
            />
            <div className="mt-3 flex items-center justify-between px-1 pb-1">
              <span className="bbs-num">MONTHLY DASHBOARD</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-900"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Live auto updates</span>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-2 hidden rotate-[-3deg] rounded-lg border-[1.5px] border-neutral-900 bg-volt px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-900 shadow-[3px_3px_0_#0f0f0f] sm:block">
            10 dashboards · 1 file
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="bbs-stats">
        {[
          [FileSpreadsheet, "10", "Auto dashboards"],
          [Zap, "0", "Formulas to write"],
          [InfinityIcon, "1×", "Payment, lifetime use"],
          [Smartphone, "Excel + Sheets", "Phone, laptop, tablet"],
        ].map(([Icon, big, small]) => (
          <div key={small} className="rounded-xl border-[1.5px] border-neutral-900 bg-white p-4">
            <Icon className="h-5 w-5 text-neutral-900" />
            <p className="bbs-h mt-2 text-2xl">{big}</p>
            <p className="text-[13px] font-medium text-neutral-600">{small}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ---------------- interactive preview ---------------- */
export const Preview = () => {
  const [i, setI] = useState(3);
  const d = DASHBOARDS[i];
  const go = (n) => setI((cur) => (cur + n + DASHBOARDS.length) % DASHBOARDS.length);

  // Warm the next image so switching tabs feels instant.
  useEffect(() => {
    const next = new Image();
    next.src = DASHBOARDS[(i + 1) % DASHBOARDS.length].img;
  }, [i]);

  return (
    <section id="inside" className="scroll-mt-20 py-14 md:py-20">
      <div className="bbs-container">
        <Reveal><SectionLabel num="02">Take a look inside</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h2 className="bbs-h mx-auto max-w-2xl text-center text-3xl sm:text-4xl">One file. Ten dashboards. Zero formulas to write.</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-neutral-600">Tap any tab to see the real sheet. Every tab updates itself the moment you type a number.</p>
        </Reveal>

        <div className="mx-auto mt-8 max-w-5xl">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" role="tablist" data-testid="bbs-preview-tabs">
            {DASHBOARDS.map((t, idx) => (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={idx === i}
                onClick={() => setI(idx)}
                data-testid={`bbs-preview-tab-${idx}`}
                className={`shrink-0 rounded-full border-[1.5px] px-4 py-1.5 text-[13px] font-bold transition-colors ${idx === i ? "border-neutral-900 bg-neutral-900 text-volt" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="bbs-card mt-4 p-3 sm:p-4" data-testid="bbs-preview-frame">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="ml-3 truncate font-mono text-[11px] text-neutral-500">Business-Bookkeeping-System.xlsx — {d.name}</span>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50" style={{ aspectRatio: "1217 / 552" }}>
              <img key={d.img} src={d.img} alt={`${d.name} dashboard`} className="bbs-fade-in absolute inset-0 h-full w-full object-contain" loading="lazy" decoding="async" draggable="false" />
              <button type="button" onClick={() => go(-1)} aria-label="Previous dashboard" data-testid="bbs-preview-prev" className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-neutral-900 bg-white/95 shadow-sm">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next dashboard" data-testid="bbs-preview-next" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-neutral-900 bg-white/95 shadow-sm">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[14px] text-neutral-700" data-testid="bbs-preview-caption"><span className="font-bold text-neutral-900">{d.name}</span> · {d.desc}</p>
              <span className="bbs-num">{String(i + 1).padStart(2, "0")} / {DASHBOARDS.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bbs-flow-mask mt-10 py-2" aria-hidden="true">
        <div className="bbs-flow bbs-flow-left">
          {[...DASHBOARDS, ...DASHBOARDS].map((x, idx) => (
            <img key={`${x.name}-${idx}`} src={x.img} alt="" width="320" height="145" className="w-64 shrink-0 select-none rounded-lg border border-neutral-300 bg-white shadow-sm sm:w-80" loading="lazy" decoding="async" draggable="false" />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- problem ---------------- */
export const Problem = () => (
  <section className="bbs-container py-14 md:py-20">
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <Reveal>
        <SectionLabel num="01">The problem</SectionLabel>
        <h2 className="bbs-h text-3xl sm:text-4xl lg:text-5xl">
          Running a business is hard.<br />
          <span className="text-neutral-400">Managing the money shouldn&apos;t be.</span>
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-600">
          You don&apos;t need another expensive subscription or a complicated accounting course. You need one clean file that tells you the truth about your numbers the moment you type them.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="space-y-3">
          {PROBLEMS.map((p) => (
            <div key={p} className="bbs-card flex items-start gap-3 p-4">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-neutral-900 font-bold text-volt"><X className="h-3.5 w-3.5" /></span>
              <span className="text-[15px] font-medium text-neutral-800">{p}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ---------------- buy vs don't buy ---------------- */
export const Compare = () => {
  const { openBuy, price } = useBbsBuy();
  return (
    <section id="compare" className="scroll-mt-20 border-y border-neutral-300 bg-white py-14 md:py-20" data-testid="bbs-compare">
      <div className="bbs-container">
        <Reveal><SectionLabel num="03">The difference</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h2 className="bbs-h mx-auto max-w-2xl text-center text-3xl sm:text-4xl">If you don&apos;t buy vs. if you buy.</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[15px] text-neutral-600">Same business, same effort — completely different clarity.</p>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border-[1.5px] border-neutral-300 bg-neutral-50 p-6" data-testid="bbs-compare-without">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-red-600"><X className="h-4 w-4" /> Without the system</p>
              <ul className="mt-5 space-y-3.5">
                {COMPARE.map(([bad]) => (
                  <li key={bad} className="flex items-start gap-3 text-[15px] text-neutral-500">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-600"><X className="h-3 w-3" /></span>{bad}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-2xl border-2 border-neutral-900 bg-ink p-6 text-white shadow-[6px_6px_0_#d4ff11]" data-testid="bbs-compare-with">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-volt"><Check className="h-4 w-4" /> With the bookkeeping system</p>
              <ul className="mt-5 space-y-3.5">
                {COMPARE.map(([, good]) => (
                  <li key={good} className="flex items-start gap-3 text-[15px] font-medium text-neutral-100">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-volt text-neutral-900"><Check className="h-3 w-3" /></span>{good}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <div className="mt-9 text-center">
          <button type="button" onClick={() => openBuy(true)} data-testid="bbs-compare-buy" className="bbs-btn">I want the clarity · ₹{price} <ArrowUpRight className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
};

/* ---------------- how it works ---------------- */
export const HowItWorks = () => {
  const { openBuy, price } = useBbsBuy();
  const steps = [
    { icon: CreditCard, n: "01", t: `Pay ₹${price} once`, d: "UPI, card or netbanking via Razorpay. No subscription, no hidden fees." },
    { icon: Download, n: "02", t: "Download instantly", d: "Your download page opens right after payment — and the links land in your email too." },
    { icon: Mail, n: "03", t: "Copy & start", d: "Make a copy in Google Sheets or open in Excel. Type your numbers — done." },
  ];
  return (
    <section id="how" className="scroll-mt-20 py-14 md:py-20">
      <div className="bbs-container">
        <Reveal><SectionLabel num="04">How it works</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h2 className="bbs-h mx-auto max-w-xl text-center text-3xl sm:text-4xl">From payment to profit in under a minute.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div className="bbs-card h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-neutral-900 text-volt"><s.icon className="h-6 w-6" /></span>
                  <span className="bbs-num">{s.n}</span>
                </div>
                <h3 className="bbs-h mt-4 text-xl">{s.t}</h3>
                <p className="mt-2 text-[15px] text-neutral-600">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-9 text-center">
          <button type="button" onClick={() => openBuy(true)} data-testid="bbs-how-buy" className="bbs-btn">Start now · ₹{price} <ArrowUpRight className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
};

/* ---------------- pricing + add-on ---------------- */
export const Pricing = () => {
  const { openBuy, price, regularPrice, highlight, addOns, selected, toggleAddOn, total } = useBbsBuy();
  const addOn = addOns[0];
  const addOnOn = addOn && selected.includes(addOn.slug);
  return (
    <section id="bbs-pricing" className="scroll-mt-16 border-y border-neutral-300 bg-white py-14 md:py-20">
      <div className="bbs-container">
        <Reveal><SectionLabel num="05">Pricing · Pay once</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h2 className="bbs-h mx-auto max-w-xl text-center text-3xl sm:text-4xl">Your entire business finance system. One file.</h2>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[12px] font-bold uppercase tracking-wider text-neutral-700">
            <Timer className="h-4 w-4" /> <Countdown className="text-red-600" testId="bbs-pricing-timer" prefix="Launch price ends in " expiredText="Launch price — ending soon" />
          </p>
        </Reveal>

        <div className={`mx-auto mt-10 grid max-w-5xl items-start gap-6 rounded-3xl transition-all duration-500 lg:grid-cols-[1fr_1fr] ${highlight ? "ring-4 ring-volt ring-offset-4" : ""}`}>
          {/* main product */}
          <div className="overflow-hidden rounded-2xl border-2 border-neutral-900 bg-ink p-7 text-center text-white sm:p-8" data-testid="bbs-pricing-card">
            <p className="bbs-num !text-neutral-400">Business Bookkeeping Sheet System</p>
            <div className="mt-4 flex items-end justify-center gap-2">
              <span className="pb-2 font-display text-2xl font-bold text-neutral-500 line-through">₹{regularPrice}</span>
              <span data-testid="bbs-pricing-price" className="bbs-h text-6xl !text-volt">₹{price}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">One-time · No subscription</p>
            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
              {INCLUDES.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[15px] text-neutral-200"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-volt text-neutral-900"><Check className="h-3.5 w-3.5" /></span>{it}</li>
              ))}
            </ul>
          </div>

          {/* add-on + total */}
          <div className="space-y-4">
            {addOn && (
              <button
                type="button"
                onClick={() => toggleAddOn(addOn.slug)}
                aria-pressed={!!addOnOn}
                data-testid={`bbs-addon-${addOn.slug}`}
                className={`relative block w-full overflow-hidden rounded-2xl border-2 bg-white p-5 text-left transition-all duration-200 ${addOnOn ? "border-neutral-900 shadow-[6px_6px_0_#d4ff11]" : "border-dashed border-neutral-400 hover:border-neutral-900"}`}
              >
                <span className="absolute right-0 top-0 rounded-bl-xl bg-neutral-900 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
                  <Gift className="mr-1 inline h-3 w-3" /> Add-on · only here
                </span>
                <div className="flex items-start gap-3 pt-3">
                  <span className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${addOnOn ? "border-neutral-900 bg-volt" : "border-neutral-400 bg-white"}`}>
                    {addOnOn && <Check className="h-4 w-4 text-neutral-900" />}
                  </span>
                  <img src={addOn.cover_image || `${SHOTS}/productivity-bundle.webp`} alt="" width="72" height="72" loading="lazy" decoding="async" className="h-[72px] w-[72px] shrink-0 rounded-lg border border-neutral-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[16px] font-extrabold leading-tight text-neutral-900">Yes! Add the {addOn.title}</p>
                    <p className="mt-1 text-[13px] text-neutral-600">Everything to <b>run & grow</b> the business — not just track it.</p>
                    <p className="mt-1.5 font-display text-xl font-extrabold text-neutral-900">+ ₹{addOnPrice(addOn)}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 border-t border-dashed border-neutral-300 pt-3.5">
                  {ADDON_ITEMS.map(([emo, txt]) => (
                    <li key={txt} className="flex items-start gap-2.5 text-[14px] font-medium text-neutral-800"><span className="w-5 shrink-0 text-center">{emo}</span>{txt}</li>
                  ))}
                </ul>
                <p className={`mt-4 rounded-lg px-3 py-2 text-center text-[13px] font-bold ${addOnOn ? "bg-volt text-neutral-900" : "bg-neutral-100 text-neutral-700"}`}>
                  {addOnOn ? "✓ Added to your order" : "Tap to add to your order"}
                </p>
              </button>
            )}

            <div className="rounded-2xl border-[1.5px] border-neutral-900 bg-white p-5">
              <div className="flex items-center justify-between text-[14px] text-neutral-700">
                <span>Bookkeeping Sheet System</span><span className="font-bold">₹{price}</span>
              </div>
              {addOnOn && (
                <div className="mt-1.5 flex items-center justify-between text-[14px] text-neutral-700">
                  <span>{addOn.title}</span><span className="font-bold">₹{addOnPrice(addOn)}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-neutral-300 pt-3">
                <span className="font-bold text-neutral-900">Total today</span>
                <span className="bbs-h text-3xl" data-testid="bbs-total">₹{total}</span>
              </div>
              <button type="button" onClick={() => openBuy(true)} data-testid="bbs-pricing-buy" className="bbs-btn mt-4 w-full text-lg">
                Buy now · ₹{total} <ArrowUpRight className="h-5 w-5" />
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-neutral-500"><Lock className="h-3.5 w-3.5" /> Secure Razorpay checkout · Instant download + email</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {["UPI", "GPay", "PhonePe", "Cards", "Netbanking"].map((m) => (
                  <span key={m} className="rounded border border-neutral-300 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-600">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- faq ---------------- */
export const Faq = () => {
  const { price, addOns } = useBbsBuy();
  const list = faqs(price, addOns[0] ? addOnPrice(addOns[0]) : 149);
  return (
    <section id="faq" className="bbs-container scroll-mt-20 py-14 md:py-20">
      <Reveal><SectionLabel num="06">Questions</SectionLabel></Reveal>
      <Reveal delay={0.05}>
        <h2 className="bbs-h text-center text-3xl sm:text-4xl">Everything you might ask.</h2>
      </Reveal>
      <div className="mx-auto mt-9 max-w-2xl">
        <Accordion type="single" collapsible className="space-y-3">
          {list.map(([q, a], i) => (
            <AccordionItem key={q} value={`bbs-item-${i}`} className="bbs-card overflow-hidden px-5">
              <AccordionTrigger className="py-5 text-left font-display text-[15px] font-bold text-neutral-900 hover:no-underline">{q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-neutral-600">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

/* ---------------- final cta ---------------- */
export const FinalCta = () => {
  const { openBuy, price } = useBbsBuy();
  return (
    <section className="border-t border-neutral-300 bg-ink py-16 text-center">
      <div className="bbs-container">
        <Reveal>
          <p className="bbs-num !text-volt">Ready when you are</p>
          <h2 className="bbs-h mx-auto mt-4 max-w-2xl text-3xl !text-white sm:text-5xl">Stop guessing. Start seeing your numbers clearly.</h2>
          <button type="button" onClick={() => openBuy(true)} data-testid="bbs-final-buy" className="bbs-btn mt-8 text-lg">Get it for ₹{price} <ArrowUpRight className="h-5 w-5" /></button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-neutral-400"><ShieldCheck className="h-4 w-4" /> One-time payment · Lifetime access · Excel & Google Sheets</p>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- sticky buy bar (all screens) ---------------- */
export const StickyCta = () => {
  const { checkoutNow, loading, price, regularPrice, total, selected } = useBbsBuy();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShow(window.scrollY > 520);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t-2 border-neutral-900 bg-white/95 backdrop-blur-md transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-testid="bbs-sticky-bar"
    >
      <div className="bbs-container flex items-center gap-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-neutral-900 sm:text-sm">Bookkeeping Sheet System{selected.length ? " + Add-on" : ""}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-neutral-600">
            <span className="font-bold text-neutral-900">₹{total}</span>
            {!selected.length && <span className="line-through">₹{regularPrice}</span>}
            <span className="inline-flex items-center gap-1 font-mono font-bold text-red-600"><Timer className="h-3 w-3" /><Countdown testId="bbs-sticky-timer" expiredText="Limited" /></span>
          </p>
        </div>
        <button type="button" onClick={checkoutNow} disabled={loading} data-testid="bbs-sticky-buy" className="bbs-btn shrink-0 !px-5 !py-2.5 !text-[15px] !shadow-[3px_3px_0_#d4ff11] disabled:opacity-70">
          {loading ? "Opening…" : `Buy Now · ₹${total || price}`}
        </button>
      </div>
    </div>
  );
};

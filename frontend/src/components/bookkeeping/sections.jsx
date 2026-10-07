import { useEffect, useState } from "react";
import * as Lucide from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { useBbsBuy } from "./LandingContext";

/* ---------------- content (ported from the Spreadsheet-Excel repo) ---------------- */
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
const FAQS = [
  ["Do I need any special software?", "No. It's a spreadsheet that works in Google Sheets and Microsoft Excel. If you can open a spreadsheet, you can use this."],
  ["Is it really fully editable?", "Yes. Change categories, colours, labels and formulas however you like. It's your copy forever."],
  ["How do I receive the file after buying?", "The instant your payment succeeds we email your access to you, and it also appears right here to open — with your Google Sheets & Excel links plus a video tutorial."],
  ["Is this a one-time payment?", "Absolutely. Pay ₹290 once via Razorpay and it's yours for life. No subscriptions, no recurring charges."],
  ["Will my numbers calculate automatically?", "Yes. Just enter your income and expenses — profit & loss, taxes and every dashboard update themselves with graphs."],
];
const NAV_LINKS = [
  { label: "Inside", href: "#inside" },
  { label: "How It Works", href: "#how" },
  { label: "Pricing", href: "#bbs-pricing" },
  { label: "FAQ", href: "#faq" },
];

/* ---------------- shared ---------------- */
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

const SectionLabel = ({ num, children }) => (
  <div className="bbs-num mb-3 text-center">{`[ ${num} ] — ${children}`}</div>
);

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

/* ---------------- hero ---------------- */
export const Hero = () => {
  const { openBuy, price, regularPrice } = useBbsBuy();
  return (
    <section className="bbs-container relative pb-14 pt-12 md:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Reveal><span className="bbs-tag"><Lucide.Sparkles className="h-3.5 w-3.5" /> One Excel file · No software · Lifetime</span></Reveal>
          <Reveal delay={0.05}>
            <h1 className="bbs-h mt-5 text-[2.7rem] sm:text-6xl lg:text-[4.2rem]">
              The last<br />
              <span className="bg-volt px-2">spreadsheet</span><br />
              you'll ever need.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-600 sm:text-base">
              Track income, expenses, profit &amp; loss, taxes and monthly, quarterly &amp; annual dashboards — all automatically, with clean graphs. Works in Excel or Google Sheets.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={() => openBuy()} data-testid="bbs-hero-buy" className="bbs-btn text-base">
                Get lifetime access · ₹{price} <Lucide.ArrowUpRight className="h-5 w-5" />
              </button>
              <a href="#inside" className="bbs-btn-ghost">Take a look inside</a>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-semibold text-neutral-600">
              <span className="flex items-center gap-1.5"><Lucide.Check className="h-4 w-4 text-neutral-900" /> Fully editable</span>
              <span className="flex items-center gap-1.5"><Lucide.Check className="h-4 w-4 text-neutral-900" /> Auto-calculated</span>
              <span className="flex items-center gap-1.5"><Lucide.Check className="h-4 w-4 text-neutral-900" /> Instant access</span>
              <span className="text-neutral-400 line-through">₹{regularPrice}</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="bbs-card rotate-1 p-3 transition-transform hover:rotate-0">
            <img src={`${SHOTS}/monthly.webp`} alt="Monthly dashboard of the bookkeeping sheet" className="w-full rounded-lg" loading="lazy" draggable="false" style={{ pointerEvents: "none" }} />
            <div className="mt-3 flex items-center justify-between px-1 pb-1">
              <span className="bbs-num">MONTHLY DASHBOARD</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-900"><span className="h-2 w-2 rounded-full bg-neutral-900" /> Live auto updates</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- flowing dashboard gallery ---------------- */
export const DashboardFlow = () => (
  <section id="inside" className="py-14 md:py-20 scroll-mt-20">
    <div className="bbs-container">
      <Reveal><SectionLabel num="02">Take a look inside</SectionLabel></Reveal>
      <Reveal delay={0.05}>
        <h2 className="bbs-h mx-auto max-w-2xl text-center text-3xl sm:text-4xl">One file. Ten dashboards. Zero formulas to write.</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-neutral-600">Every tab updates itself the moment you type a number. Watch the real sheets flow past.</p>
      </Reveal>
    </div>
    <Reveal delay={0.08}>
      <div className="bbs-flow-mask mt-10 py-2" data-testid="bbs-flow-gallery">
        <div className="bbs-flow bbs-flow-left">
          {[...DASHBOARDS, ...DASHBOARDS].map((d, i) => (
            <figure key={`${d.name}-${i}`} className="w-72 shrink-0 sm:w-96" style={{ pointerEvents: "none" }}>
              <img src={d.img} alt={`${d.name} dashboard`} className="w-full select-none rounded-lg border border-neutral-300 bg-white shadow-sm" loading="lazy" draggable="false" />
              <figcaption className="mt-2 px-1 text-[13px] text-neutral-600">
                <span className="font-bold text-neutral-900">{d.name}</span> · {d.desc}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Reveal>
  </section>
);

/* ---------------- how it works ---------------- */
export const HowItWorks = () => {
  const { openBuy, price } = useBbsBuy();
  const steps = [
    { icon: Lucide.CreditCard, n: "01", t: "Buy for ₹290", d: "One-time payment. No subscription, no hidden fees, ever." },
    { icon: Lucide.Mail, n: "02", t: "Get it on email", d: "Your Google Sheet + tutorial land in your inbox within seconds." },
    { icon: Lucide.Download, n: "03", t: "Copy & use", d: "Make a copy in Google Sheets or open in Excel. Start entering numbers." },
  ];
  return (
    <section id="how" className="border-t border-neutral-300 bg-white py-14 md:py-20 scroll-mt-20">
      <div className="bbs-container">
        <Reveal><SectionLabel num="03">How it works</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h2 className="bbs-h mx-auto max-w-xl text-center text-3xl sm:text-4xl">From payment to profit in under a minute.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
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
        <Reveal delay={0.2}>
          <div className="mt-9 text-center">
            <button type="button" onClick={() => openBuy(true)} data-testid="bbs-how-buy" className="bbs-btn">Start now · ₹{price} <Lucide.ArrowUpRight className="h-5 w-5" /></button>
          </div>
        </Reveal>
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
          <span className="text-neutral-400">Managing the money shouldn't be.</span>
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-600">
          You don't need another expensive subscription or a complicated accounting course. You need one clean file that tells you the truth about your numbers the moment you type them.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="space-y-3">
          {PROBLEMS.map((p) => (
            <div key={p} className="bbs-card flex items-start gap-3 p-4">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-neutral-900 font-bold text-volt"><Lucide.X className="h-3.5 w-3.5" /></span>
              <span className="text-[15px] font-medium text-neutral-800">{p}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ---------------- pricing ---------------- */
export const Pricing = () => {
  const { openBuy, price, regularPrice, highlight } = useBbsBuy();
  return (
    <section id="bbs-pricing" className="border-y border-neutral-300 bg-white py-14 md:py-20 scroll-mt-20">
      <div className="bbs-container">
        <Reveal><SectionLabel num="04">One plan · Everything included</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h2 className="bbs-h mx-auto max-w-xl text-center text-3xl sm:text-4xl">Your entire business finance system. One file.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className={`mx-auto mt-10 max-w-lg overflow-hidden rounded-2xl border-2 p-8 text-center transition-all duration-500 ${highlight ? "border-neutral-900 ring-4 ring-volt/40 bg-volt/10" : "border-neutral-900 bg-ink text-white"}`} data-testid="bbs-pricing-card">
            <p className="bbs-num !text-neutral-400">Pay once. Own it forever.</p>
            <div className="mt-4 flex items-end justify-center gap-2">
              <span className="pb-2 font-display text-2xl font-bold text-neutral-500 line-through">₹{regularPrice}</span>
              <span data-testid="bbs-pricing-price" className="bbs-h text-6xl !text-volt">₹{price}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">One-time · No subscription</p>
            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
              {INCLUDES.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[15px] text-neutral-200"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-volt text-neutral-900"><Lucide.Check className="h-3.5 w-3.5" /></span>{it}</li>
              ))}
            </ul>
            <button type="button" onClick={() => openBuy(true)} data-testid="bbs-pricing-buy" className="bbs-btn mt-7 w-full text-lg">
              Buy now · Instant access <Lucide.ArrowUpRight className="h-5 w-5" />
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-neutral-400"><Lucide.ShieldCheck className="h-3.5 w-3.5" /> Emailed instantly + open on screen · Payments secured by Razorpay</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- faq ---------------- */
export const Faq = () => (
  <section id="faq" className="bbs-container py-14 md:py-20 scroll-mt-20">
    <Reveal><SectionLabel num="05">Questions</SectionLabel></Reveal>
    <Reveal delay={0.05}>
      <h2 className="bbs-h text-center text-3xl sm:text-4xl">Everything you might ask.</h2>
    </Reveal>
    <Reveal delay={0.08}>
      <div className="mx-auto mt-9 max-w-2xl space-y-3">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map(([q, a], i) => (
            <AccordionItem key={i} value={`bbs-item-${i}`} className="bbs-card overflow-hidden px-5">
              <AccordionTrigger className="py-5 text-left font-display text-[15px] font-bold text-neutral-900 hover:no-underline">{q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-neutral-600">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Reveal>
  </section>
);

/* ---------------- final cta ---------------- */
export const FinalCta = () => {
  const { openBuy, price } = useBbsBuy();
  return (
    <section className="border-t border-neutral-300 bg-ink py-16 text-center">
      <div className="bbs-container">
        <Reveal>
          <p className="bbs-num !text-volt">Ready when you are</p>
          <h2 className="bbs-h mx-auto mt-4 max-w-2xl text-3xl !text-white sm:text-5xl">Stop guessing. Start seeing your numbers clearly.</h2>
          <button type="button" onClick={() => openBuy(true)} data-testid="bbs-final-buy" className="bbs-btn mt-8 text-lg">Get it for ₹{price} <Lucide.ArrowUpRight className="h-5 w-5" /></button>
          <p className="mt-4 text-sm text-neutral-400">One-time payment · Lifetime access · Excel & Google Sheets</p>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- sticky mobile cta ---------------- */
export const StickyCta = () => {
  const { openBuy, price } = useBbsBuy();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-30 border-t-2 border-neutral-900 bg-white/95 p-3 backdrop-blur-md transition-transform sm:hidden ${show ? "translate-y-0" : "translate-y-full"}`}>
      <button type="button" onClick={() => openBuy()} data-testid="bbs-sticky-buy" className="bbs-btn w-full">Business Toolkit · ₹{price}</button>
    </div>
  );
};
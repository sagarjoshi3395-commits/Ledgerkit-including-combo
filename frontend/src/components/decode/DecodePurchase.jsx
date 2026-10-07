import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import PricingEditions from "../PricingEditions";
import FaqAccordion from "../FaqAccordion";
import CountdownTimer from "../CountdownTimer";
import { CheckoutButton } from "../CheckoutButton";
import { ShieldCheck, Zap, Headset, ImagePlus } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Secure Payment", text: "Payment is handled through the configured payment provider." },
  { icon: Zap, title: "Instant Digital Delivery", text: "Digital access instructions are provided after successful payment." },
  { icon: Headset, title: "Support Available", text: "Email ledgerkitsupport@gmail.com for any payment or access issue — we reply personally." },
];

export function PricingSection({ product, selected, onSelect }) {
  return (
    <section id="editions" className="scroll-mt-20 py-16 sm:py-24" data-testid="pricing-section">
      <div className="container-site">
        <SectionHeading
          eyebrow="Launch Offer"
          title="Get the Complete Guide — Digital Edition"
          description="One complete guide. Instant digital access on any device. Transparent pricing — no false scarcity."
          testId="pricing"
        />
        <Reveal className="mt-8 flex justify-center">
          <CountdownTimer minutes={10} />
        </Reveal>
        <div className="mt-10">
          <PricingEditions product={product} selected={selected} onSelect={onSelect} />
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3" data-testid="checkout-trust">
          {TRUST_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 text-center">
                <item.icon className="h-5 w-5 text-brand-600" />
                <h4 className="font-display text-sm font-bold text-ink">{item.title}</h4>
                <p className="text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DecodeFaqSection({ product }) {
  const faqs = product?.faqs || [];
  if (!faqs.length) return null;
  return (
    <section className="bg-white py-16 sm:py-24" data-testid="decode-faq-section">
      <div className="container-site max-w-3xl">
        <SectionHeading eyebrow="Questions, Answered" title="Meta Ads Decode — FAQ" testId="decode-faq" />
        <div className="mt-10">
          <FaqAccordion items={faqs} testId="decode-faq" />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500" data-testid="faq-support-note">
          Still stuck? Email us at <a href="mailto:ledgerkitsupport@gmail.com" className="font-semibold text-brand-600 underline underline-offset-2">ledgerkitsupport@gmail.com</a> — we reply personally.
        </p>
      </div>
    </section>
  );
}

export function FinalCtaSection({ product, onSelect }) {
  const editions = product?.editions || {};
  return (
    <section className="ink-section dot-grid-dark py-16 sm:py-24" data-testid="final-cta-section">
      <div className="container-site text-center">
        <Reveal>
          <span className="eyebrow-dark">Research → Product → Ads → Analysis → Scaling → Measurement</span>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl" data-testid="final-cta-title">
            Three Years of Experience. One Complete Practical Guide.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Learn the complete digital-product and Meta Ads system through practical workflows, campaign examples, frameworks, checklists and real-world lessons. Stop guessing what to do next — understand the whole system.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3" data-testid="final-cta-buttons">
            {editions.digital && (
              <CheckoutButton product={product} edition="digital" testId="final-buy-digital" className="bg-brand-600 px-10 py-4 text-base text-white hover:bg-brand-700" />
            )}
            <button
              type="button"
              onClick={() => document.getElementById("samples")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="final-preview-link"
              className="text-sm font-semibold text-slate-300 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Preview sample pages first
            </button>
          </div>
          <p className="mx-auto mt-3 max-w-xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-slate-500">
            Digital Product • Secure Checkout • Instant Access
          </p>
          <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-slate-500">
            Educational product. Advertising and business results vary based on product, market, offer, creative, budget, competition and execution.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

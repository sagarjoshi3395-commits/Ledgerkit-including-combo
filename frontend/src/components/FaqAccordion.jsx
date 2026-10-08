import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export default function FaqAccordion({ items = [], dark = false, testId = "faq" }) {
  if (!items.length) return null;
  return (
    <Accordion type="single" collapsible className="space-y-3" data-testid={`${testId}-accordion`}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className={`rounded-xl border px-5 ${dark ? "border-white/10 bg-ink-card" : "border-slate-200 bg-white"}`}
        >
          <AccordionTrigger
            className={`py-4 text-left font-display text-sm font-bold hover:no-underline sm:text-base ${dark ? "text-white" : "text-ink"}`}
            data-testid={`${testId}-item-${i}-trigger`}
          >
            {item.q}
          </AccordionTrigger>
          <AccordionContent className={`pb-4 text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

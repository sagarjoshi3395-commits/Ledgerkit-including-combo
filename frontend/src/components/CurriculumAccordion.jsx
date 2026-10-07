import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Dot } from "lucide-react";

export default function CurriculumAccordion({ curriculum = [] }) {
  if (!curriculum.length) return null;
  return (
    <Accordion type="single" collapsible className="space-y-3" data-testid="curriculum-accordion">
      {curriculum.map((part, i) => (
        <AccordionItem
          key={part.part + i}
          value={`part-${i}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white px-5 data-[state=open]:ring-1 data-[state=open]:ring-brand-200"
        >
          <AccordionTrigger
            className="py-5 hover:no-underline"
            data-testid={`curriculum-part-${i}-trigger`}
          >
            <div className="flex items-center gap-4 text-left">
              <span className="hidden shrink-0 rounded-lg bg-ink-surface px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-400 sm:inline-block">
                {part.part}
              </span>
              <div>
                <div className="font-display text-base font-bold text-ink sm:text-lg">
                  <span className="mr-2 font-mono text-xs font-semibold uppercase tracking-wider text-brand-600 sm:hidden">{part.part}</span>
                  {part.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{part.topics.length} sections</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2" data-testid={`curriculum-part-${i}-topics`}>
              {part.topics.map((topic, j) => (
                <li key={j} className="flex items-start text-sm text-slate-600">
                  <Dot className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

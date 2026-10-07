import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const DEFAULT_STEPS = [
  "Research", "Validate", "Create", "Build Offer", "Build Website", "Tracking",
  "Creative", "Launch", "Test", "Diagnose", "Find Winners", "Scale",
  "Retarget", "Optimize Funnel", "Measure Profitability", "Expand",
];

/** Animated complete-system workflow path. */
export default function WorkflowSteps({ steps = DEFAULT_STEPS }) {
  const reduce = useReducedMotion();
  return (
    <ol className="flex flex-wrap items-stretch gap-y-4" data-testid="system-workflow">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.6) }}
            className="flex items-center gap-2.5 rounded-lg bg-ink-card px-3.5 py-2.5 ring-1 ring-white/10 transition-colors duration-200 hover:ring-brand-500/50"
            data-testid={`workflow-step-${i}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600/15 font-mono text-[10px] font-bold text-brand-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="whitespace-nowrap text-sm font-semibold text-slate-200">{step}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <ArrowRight className="mx-1.5 h-4 w-4 shrink-0 animate-pulse-dot text-brand-500/70" aria-hidden />
          )}
        </li>
      ))}
    </ol>
  );
}

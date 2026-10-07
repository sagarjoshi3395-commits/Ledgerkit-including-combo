import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, description, dark = false, align = "center", testId }) {
  const alignCls = align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <Reveal className={`flex flex-col gap-4 ${alignCls} max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
      {eyebrow && <span className={dark ? "eyebrow-dark" : "eyebrow"} data-testid={testId ? `${testId}-eyebrow` : undefined}>{eyebrow}</span>}
      <h2
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug ${dark ? "text-white" : "text-ink"}`}
        data-testid={testId ? `${testId}-title` : undefined}
      >
        {title}
      </h2>
      {description && (
        <p className={`text-base leading-relaxed ${dark ? "text-slate-400" : "text-muted-foreground"}`} data-testid={testId ? `${testId}-desc` : undefined}>
          {description}
        </p>
      )}
    </Reveal>
  );
}

export function BookMockup({ size = "md", className = "", title = "DIGITAL PRODUCT SALES ENGINE", subtitle = "The Complete Digital Product Playbook", brand = "LEDGERKIT", coverImage = "" }) {
  const dims = size === "lg" ? "w-56 sm:w-64" : size === "sm" ? "w-28" : "w-40 sm:w-44";
  const titleSize = size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-[10px]" : "text-sm sm:text-base";
  const subSize = size === "lg" ? "text-[10px] sm:text-xs" : "text-[7px] sm:text-[8px]";
  if (coverImage) {
    return (
      <div className={`relative ${dims} ${className}`} data-testid="book-mockup">
        <img src={coverImage} alt={title} loading="lazy" className="w-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.45)]" />
      </div>
    );
  }
  return (
    <div className={`relative ${dims} ${className}`} style={{ perspective: "900px" }} data-testid="book-mockup">
      <div
        className="relative aspect-[3/4.2] rounded-r-md rounded-l-[3px] bg-ink-surface ring-1 ring-white/15 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ transform: "rotateY(-14deg) rotateX(4deg)", transformStyle: "preserve-3d" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[7%] bg-black/50 rounded-l-[3px]" />
        <div className="absolute left-[7%] top-0 bottom-0 w-px bg-white/10" />
        <div className="absolute inset-0 dot-grid-dark opacity-60" />
        <div className="relative h-full flex flex-col justify-between p-[9%] pl-[14%]">
          <div>
            <div className="font-mono text-brand-500 font-bold tracking-[0.25em] text-[8px] sm:text-[10px]">{brand}</div>
            <div className="mt-1 h-px w-8 bg-brand-500" />
          </div>
          <div>
            <div className={`font-display font-extrabold text-white leading-[1.05] tracking-tight ${titleSize}`}>{title}</div>
            <div className={`mt-2 text-slate-400 leading-snug ${subSize}`}>{subtitle}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span className={`font-mono uppercase tracking-[0.2em] text-slate-500 ${subSize}`}>Digital Edition • Instant Access</span>
          </div>
        </div>
      </div>
      <div className="absolute inset-y-[2%] -right-1.5 w-1.5 rounded-r-sm bg-slate-200" style={{ transform: "translateZ(-6px)" }} />
    </div>
  );
}

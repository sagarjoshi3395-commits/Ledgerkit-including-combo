import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Logo } from "./Navbar";
import { FOOTER_PRODUCTS, FOOTER_COMPANY, FOOTER_LEGAL } from "../lib/siteContent";
import { api } from "../lib/api";

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              data-testid={`footer-${l.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get("/settings")).data,
    staleTime: 300_000,
  });

  return (
    <footer className="ink-section dot-grid-dark" data-testid="site-footer">
      <div className="container-site py-14 sm:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Practical digital guides that turn complicated business, marketing and Meta Ads concepts into structured, step-by-step systems.
            </p>
          </div>
          <FooterCol title="Products" links={FOOTER_PRODUCTS} />
          <FooterCol title="Company" links={FOOTER_COMPANY} />
          <FooterCol title="Legal" links={FOOTER_LEGAL} />
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Support</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li data-testid="footer-support-email">
                Email: {settings?.support_email || <span className="placeholder-token">[SUPPORT EMAIL]</span>}
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {settings?.brand_name || "Decode"}. All rights reserved.</span>
          <span>Independent educational products. Not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc.</span>
        </div>
      </div>
    </footer>
  );
}

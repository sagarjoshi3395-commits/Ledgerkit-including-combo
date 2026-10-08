import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { NAV_LINKS } from "../lib/siteContent";

export function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-surface">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-[#FFD400]" />
      </span>
      <span className={`font-display text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
        LedgerKit<span className="text-brand-600">.</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-[#FAFAFA]/92 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "border-slate-200 shadow-subtle" : "border-transparent"
      }`}
      data-testid="main-header"
    >
      <div className={`container-site flex items-center justify-between transition-all duration-300 ${scrolled ? "py-2.5" : "py-4"}`}>
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" data-testid="desktop-nav">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-ink bg-slate-100" : "text-slate-600 hover:text-ink hover:bg-slate-100/70"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/meta-ads-decode#editions"
            data-testid="nav-cta-button"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-ink-surface px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink"
          >
            Get the Guide <ArrowRight className="h-4 w-4" />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
                data-testid="mobile-menu-button"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#FAFAFA]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/meta-ads-decode#editions"
                  data-testid="mobile-nav-cta"
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Get the Guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

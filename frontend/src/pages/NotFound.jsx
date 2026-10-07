import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "../components/Seo";

export default function NotFound() {
  return (
    <main className="container-site py-24 text-center" data-testid="not-found-page">
      <Seo title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" />
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">Page not found</h1>
      <p className="mt-3 text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" data-testid="not-found-home-link" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink-surface px-6 py-3 text-sm font-semibold text-white hover:bg-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
    </main>
  );
}

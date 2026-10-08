import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BookMockup } from "./BookMockup";
import { formatINR } from "../lib/api";

export function priceDisplay(product) {
  const digital = product?.editions?.digital;
  const sale = digital?.price ?? product?.sale_price;
  const regular = product?.regular_price;
  return { sale, regular: regular && sale && regular > sale ? regular : null };
}

export default function ProductCard({ product, index = 0 }) {
  const href = product.landing_path || `/products/${product.slug}`;
  const { sale, regular } = priceDisplay(product);
  return (
    <Link
      to={href}
      data-testid={`product-card-${product.slug}`}
      className="card-lift group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="dot-grid relative flex items-center justify-center border-b border-slate-100 bg-slate-50 px-6 py-10">
        <div className="absolute left-4 top-4 flex gap-1.5">
          {product.is_new && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700" data-testid={`product-card-${product.slug}-badge-new`}>New</span>
          )}
          {product.featured && (
            <span className="rounded-full bg-brand-100 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-700" data-testid={`product-card-${product.slug}-badge-featured`}>Featured</span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700">Bestseller</span>
          )}
        </div>
        <div className="transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:rotate-1">
          <BookMockup size="sm" coverImage={product.cover_image} title={product.short_title?.toUpperCase() || product.title.toUpperCase()} subtitle={product.product_type} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600">
          {(product.category || "guide").replace(/-/g, " ")} • {product.product_type || "Guide"}
        </span>
        <h3 className="font-display text-lg font-bold leading-snug text-ink">{product.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-2" data-testid={`product-card-${product.slug}-price`}>
            {sale != null ? (
              <>
                <span className="font-display text-lg font-extrabold text-ink">{formatINR(sale)}</span>
                {regular && <span className="text-sm text-slate-400 line-through">{formatINR(regular)}</span>}
              </>
            ) : (
              <span className="text-sm font-medium text-slate-500">Price TBA</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-brand-600">
            View Details <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

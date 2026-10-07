import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import ProductCard from "../components/ProductCard";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "featured";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
    staleTime: 300_000,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", { search, category, sort }],
    queryFn: async () => (await api.get("/products", { params: { search: search || undefined, category, sort } })).data,
    staleTime: 30_000,
  });

  const count = useMemo(() => products.length, [products]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || (key === "sort" && value === "featured")) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <main className="py-14 sm:py-20" data-testid="products-page">
      <Seo title="All Products" description="Browse practical digital guides, ebooks and templates on marketing, Meta Ads, business and digital products." path="/products" />
      <div className="container-site">
        <span className="eyebrow">Store</span>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl" data-testid="products-title">All Products</h1>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500" data-testid="products-count">{count} product{count === 1 ? "" : "s"}</span>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, topics…"
              className="pl-9"
              data-testid="products-search-input"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-2" data-testid="category-filters">
              <button
                type="button"
                onClick={() => setParam("category", "all")}
                data-testid="category-filter-all"
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${category === "all" ? "bg-ink-surface text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setParam("category", c.slug)}
                  data-testid={`category-filter-${c.slug}`}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${category === c.slug ? "bg-ink-surface text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
              <SelectTrigger className="w-[170px] bg-white" data-testid="products-sort-select">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured" data-testid="sort-featured">Featured first</SelectItem>
                <SelectItem value="newest" data-testid="sort-newest">Newest</SelectItem>
                <SelectItem value="price_asc" data-testid="sort-price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc" data-testid="sort-price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
          </div>
        ) : products.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="products-grid">
            {products.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
          </div>
        ) : (
          <div className="mt-16 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center" data-testid="products-empty">
            <p className="font-display text-lg font-bold text-ink">No products found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or category.</p>
          </div>
        )}
      </div>
    </main>
  );
}

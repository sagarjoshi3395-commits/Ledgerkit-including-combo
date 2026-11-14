import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PlusCircle, Send, Mail } from "lucide-react";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";

const EMPTY = { title: "", slug: "", category: "guides", tagline: "", description: "", regular_price: "", sale_price: "", checkout_url: "", featured: false, is_new: true };

/**
 * Minimal product manager. Requires ADMIN_KEY set in backend/.env; the same key
 * is entered here and sent as the x-admin-key header.
 */
export default function Admin() {
  const [form, setForm] = useState(EMPTY);
  const [adminKey, setAdminKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [resendOrderId, setResendOrderId] = useState("");
  const [resendingOne, setResendingOne] = useState(false);
  const [resendingAll, setResendingAll] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/admin/products", {
        ...form,
        regular_price: form.regular_price ? Number(form.regular_price) : null,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
      }, { headers: { "x-admin-key": adminKey } });
      toast.success("Product added", { description: `"${form.title}" is now live in the catalogue.` });
      setForm(EMPTY);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Could not add product.";
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  }

  async function handleResendOne() {
    const id = resendOrderId.trim();
    if (!id) { toast.error("Enter an order id first."); return; }
    if (!adminKey) { toast.error("Enter your admin key first."); return; }
    setResendingOne(true);
    try {
      const { data } = await api.post(`/admin/orders/${encodeURIComponent(id)}/resend-delivery`, null, { headers: { "x-admin-key": adminKey } });
      if (data.ok) toast.success("Delivery email sent", { description: `${id} → ${data.email}` });
      else toast.error("Send attempted but marked pending — check backend logs.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not resend.");
    } finally {
      setResendingOne(false);
    }
  }

  async function handleResendAllPending() {
    if (!adminKey) { toast.error("Enter your admin key first."); return; }
    if (!window.confirm("Re-send the delivery email to every paid order that hasn't been delivered yet? This can take a few minutes.")) return;
    setResendingAll(true);
    try {
      const { data } = await api.post("/admin/orders/resend-pending", null, { headers: { "x-admin-key": adminKey }, timeout: 600000 });
      toast.success("Backfill complete", { description: `Sent ${data.sent} • Failed ${data.failed} • Skipped ${data.skipped}` });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Backfill failed.");
    } finally {
      setResendingAll(false);
    }
  }

  return (
    <main className="py-14 sm:py-20" data-testid="admin-page">
      <Seo title="Admin — Add Product" description="Product management." path="/admin" />
      <div className="container-site max-w-2xl">
        <span className="eyebrow">Admin</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Add a New Product</h1>
        <p className="mt-3 text-sm text-slate-600">
          New products automatically appear in the catalogue, search, categories and (if marked Featured) the homepage. Set <code className="font-mono text-xs">ADMIN_KEY</code> in backend/.env first.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-7" data-testid="admin-product-form">
          <div>
            <Label htmlFor="a-key">Admin Key</Label>
            <Input id="a-key" type="password" className="mt-1.5" value={adminKey} onChange={set("adminKey")} placeholder="Value of ADMIN_KEY from backend/.env" data-testid="admin-key-input" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="a-title">Product Title *</Label>
              <Input id="a-title" className="mt-1.5" value={form.title} onChange={set("title")} data-testid="admin-title-input" />
            </div>
            <div>
              <Label htmlFor="a-slug">Slug * (e.g. notion-templates-pack)</Label>
              <Input id="a-slug" className="mt-1.5" value={form.slug} onChange={set("slug")} data-testid="admin-slug-input" />
            </div>
            <div>
              <Label htmlFor="a-category">Category</Label>
              <Input id="a-category" className="mt-1.5" value={form.category} onChange={set("category")} data-testid="admin-category-input" />
            </div>
            <div>
              <Label htmlFor="a-checkout">Checkout URL (SuperProfile / Razorpay link)</Label>
              <Input id="a-checkout" className="mt-1.5" value={form.checkout_url} onChange={set("checkout_url")} placeholder="https://…" data-testid="admin-checkout-input" />
            </div>
            <div>
              <Label htmlFor="a-regular">Regular Price (₹)</Label>
              <Input id="a-regular" type="number" className="mt-1.5" value={form.regular_price} onChange={set("regular_price")} data-testid="admin-regular-price-input" />
            </div>
            <div>
              <Label htmlFor="a-sale">Sale Price (₹)</Label>
              <Input id="a-sale" type="number" className="mt-1.5" value={form.sale_price} onChange={set("sale_price")} data-testid="admin-sale-price-input" />
            </div>
          </div>
          <div>
            <Label htmlFor="a-tagline">Short Description / Tagline</Label>
            <Input id="a-tagline" className="mt-1.5" value={form.tagline} onChange={set("tagline")} data-testid="admin-tagline-input" />
          </div>
          <div>
            <Label htmlFor="a-desc">Long Description</Label>
            <Textarea id="a-desc" rows={4} className="mt-1.5" value={form.description} onChange={set("description")} data-testid="admin-description-input" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700" data-testid="admin-featured-toggle">
              <Switch checked={form.featured} onCheckedChange={set("featured")} /> Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700" data-testid="admin-new-toggle">
              <Switch checked={form.is_new} onCheckedChange={set("is_new")} /> Mark as New
            </label>
          </div>
          <button type="submit" disabled={saving} data-testid="admin-submit-button" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            Add Product
          </button>
        </form>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-7" data-testid="admin-delivery-tools">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">Re-send delivery emails</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Uses the admin key entered above. Buyers from before the 14-Nov delivery fix sit at <code className="font-mono text-xs">delivery_status: pending</code> — "Send to all pending" re-delivers every one of them.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input placeholder="Paste an order id (e.g. ord_xxx)" value={resendOrderId} onChange={(e) => setResendOrderId(e.target.value)} data-testid="admin-resend-order-input" />
            <button type="button" onClick={handleResendOne} disabled={resendingOne} data-testid="admin-resend-one-button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-600 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60">
              {resendingOne ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Re-send this order
            </button>
          </div>

          <button type="button" onClick={handleResendAllPending} disabled={resendingAll} data-testid="admin-resend-all-button" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
            {resendingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send to all pending (backfill)
          </button>
        </section>
      </div>
    </main>
  );
}

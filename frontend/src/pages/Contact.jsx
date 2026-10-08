import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MapPin, Clock, Building2, Send, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CONTACT_TOPICS } from "../lib/siteContent";

function InfoRow({ icon: Icon, label, value, testId }) {
  return (
    <div className="flex items-start gap-3" data-testid={testId}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
        <Icon className="h-4 w-4 text-brand-600" />
      </span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-ink">{value || <span className="placeholder-token">[{label.toUpperCase()} — TO BE CONFIGURED]</span>}</div>
      </div>
    </div>
  );
}

export default function Contact() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get("/settings")).data,
    staleTime: 300_000,
  });
  const [form, setForm] = useState({ name: "", email: "", phone: "", order_id: "", topic: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.topic || !form.message) {
      toast.error("Please fill in name, email, topic and message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", { ...form, phone: form.phone || null, order_id: form.order_id || null });
      toast.success("Message sent", { description: "We've received your query and will get back to you soon." });
      setForm({ name: "", email: "", phone: "", order_id: "", topic: "", message: "" });
    } catch {
      toast.error("Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="py-14 sm:py-20" data-testid="contact-page">
      <Seo title="Contact Us" description="Contact Decode support for payment issues, product access, download issues, refund queries and general questions." path="/contact" />
      <div className="container-site">
        <span className="eyebrow">Support</span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl" data-testid="contact-title">Contact Us</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">Questions about an order, access or anything else — send us a message and we'll help.</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-2" data-testid="contact-info-card">
            <InfoRow icon={Building2} label="Business / Brand Name" value={settings?.brand_name} testId="contact-brand" />
            <InfoRow icon={Mail} label="Support Email" value={settings?.support_email} testId="contact-email" />
            <InfoRow icon={Clock} label="Support Hours" value={settings?.support_hours} testId="contact-hours" />
            {settings?.response_time && (
              <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200" data-testid="contact-response-time">
                Expected response time: {settings.response_time}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-3" data-testid="contact-form">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">Name *</Label>
                <Input id="c-name" className="mt-1.5" value={form.name} onChange={set("name")} data-testid="contact-name-input" />
              </div>
              <div>
                <Label htmlFor="c-email">Email *</Label>
                <Input id="c-email" type="email" className="mt-1.5" value={form.email} onChange={set("email")} data-testid="contact-email-input" />
              </div>
              <div>
                <Label htmlFor="c-phone">Phone (optional)</Label>
                <Input id="c-phone" className="mt-1.5" value={form.phone} onChange={set("phone")} data-testid="contact-phone-input" />
              </div>
              <div>
                <Label htmlFor="c-order">Order / Payment ID (optional)</Label>
                <Input id="c-order" className="mt-1.5" value={form.order_id} onChange={set("order_id")} data-testid="contact-order-input" />
              </div>
              <div className="sm:col-span-2">
                <Label>Topic *</Label>
                <Select value={form.topic} onValueChange={set("topic")}>
                  <SelectTrigger className="mt-1.5" data-testid="contact-topic-select"><SelectValue placeholder="Choose a topic" /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_TOPICS.map((t) => <SelectItem key={t} value={t} data-testid={`contact-topic-${t.toLowerCase().replace(/\s+/g, "-")}`}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-message">Message *</Label>
                <Textarea id="c-message" rows={5} className="mt-1.5" value={form.message} onChange={set("message")} data-testid="contact-message-input" />
              </div>
            </div>
            <button
              type="submit"
              disabled={sending}
              data-testid="contact-submit-button"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, formatINR } from "../lib/api";
import { trackEvent } from "../lib/analytics";
import Seo from "../components/Seo";
import StickyBuyBar from "../components/StickyBuyBar";
import PurchaseNotifications from "../components/PurchaseNotifications";
import ExitIntent from "../components/ExitIntent";
import Testimonials from "../components/Testimonials";
import DecodeHero from "../components/decode/DecodeHero";
import { ExperienceSection, ProblemSection, SystemSection } from "../components/decode/DecodeSystem";
import { SamplePagesSection, IncludedSection, CurriculumSection, VisualToolsSection } from "../components/decode/DecodeLearning";
import AspirationSection from "../components/decode/DecodeAspiration";
import AddonOffers from "../components/decode/DecodeAddons";
import { AudienceSection, CaseStudiesSection } from "../components/decode/DecodeAudience";
import { PricingSection, DecodeFaqSection, FinalCtaSection } from "../components/decode/DecodePurchase";
import { Skeleton } from "../components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function MetaAdsDecode() {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", "meta-ads-decode"],
    queryFn: async () => (await api.get("/products/meta-ads-decode")).data,
    staleTime: 60_000,
  });
  const [selectedEdition, setSelectedEdition] = useState("digital");

  useEffect(() => {
    if (product) {
      trackEvent("ViewContent", { content_name: product.slug, content_ids: [product.slug], currency: product.currency });
    }
  }, [product]);

  const faqJsonLd = product?.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: product.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  if (isLoading) {
    return (
      <div className="container-site space-y-6 py-24" data-testid="decode-loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-14 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-md" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <main data-testid="meta-ads-decode-page">
      <Seo
        title="Digital Product Sales Engine"
        description="A complete digital product guide with real Meta Ads campaign examples — research, product creation, sales pages, tracking, creative strategy, testing, scaling and business measurement. Built from 3 years of practical experience."
        path="/meta-ads-decode"
        jsonLd={faqJsonLd}
      />
      <DecodeHero product={product} onBuy={() => scrollToId("editions")} onPreview={() => scrollToId("samples")} />
      <ExperienceSection />
      <ProblemSection />
      <SamplePagesSection product={product} />
      <AspirationSection />
      <SystemSection />
      <IncludedSection product={product} />
      <CurriculumSection product={product} />
      <VisualToolsSection />
      <AudienceSection product={product} />
      <CaseStudiesSection />
      <Testimonials productSlug="meta-ads-decode" title="What Early Readers Say" />
      <PricingSection product={product} selected={selectedEdition} onSelect={setSelectedEdition} />
      <AddonOffers mainProduct={product} />
      <DecodeFaqSection product={product} />
      <FinalCtaSection product={product} onSelect={setSelectedEdition} />
      {product && <StickyBuyBar product={product} />}
      <ExitIntent onPreview={() => scrollToId("samples")} />
      <PurchaseNotifications productTitle={product?.short_title || "Meta Ads Decode"} />
    </main>
  );
}

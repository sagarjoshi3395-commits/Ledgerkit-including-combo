import Seo from "../components/Seo";
import { MrgBuyProvider } from "../components/medical/LandingContext";
import {
  AnchorStrip,
  AnnouncementBar,
  Hero,
  SamplePages,
  InsideHighlights,
  WhyCreated,
  BundleCards,
  DiseaseTopics,
  MedicineCategories,
  HowPresented,
  Bilingual,
  WhoFor,
  WhatYouReceive,
  DisclaimerCard,
  AccessSteps,
  Pricing,
  Faq,
  FinalCta,
  StickyCta,
} from "../components/medical/sections";
import "../components/medical/medical-landing.css";

export default function MedicalLanding() {
  return (
    <div className="mrg-page min-h-screen bg-white">
      <Seo
        title="Medical Diseases & Ayurvedic Reference Bundle — Illustrated Disease + Medicine Guides"
        description="140+ disease & medicine topics in 2 illustrated PDF guides — clear sections, red flags, quick-revision format, English + Hindi content. Instant digital access after payment."
        path="/medical-reference-bundle"
        image="/samples/med-disease-cover.webp"
      />
      <MrgBuyProvider>
        <main>
          <AnnouncementBar />
          <AnchorStrip />
          <Hero />
          <SamplePages />
          <Pricing />
          <InsideHighlights />
          <WhyCreated />
          <BundleCards />
          <DiseaseTopics />
          <MedicineCategories />
          <HowPresented />
          <Bilingual />
          <WhoFor />
          <WhatYouReceive />
          <DisclaimerCard />
          <AccessSteps />
          <Faq />
          <FinalCta />
        </main>
        <StickyCta />
      </MrgBuyProvider>
    </div>
  );
}

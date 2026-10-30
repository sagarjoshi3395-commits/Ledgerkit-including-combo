import Seo from "../components/Seo";
import ExitOffer from "../components/bookkeeping/ExitOffer";
import { BbsBuyProvider } from "../components/bookkeeping/LandingContext";
import {
  UrgencyBar,
  AnchorStrip,
  Marquee,
  Hero,
  Preview,
  Problem,
  Compare,
  HowItWorks,
  Pricing,
  Faq,
  FinalCta,
  StickyCta,
} from "../components/bookkeeping/sections";
import "../components/bookkeeping/bbs-landing.css";
import { useMetaPixel } from "../lib/metaPixel";

export default function BookkeepingLanding() {
  useMetaPixel("1605079064338578");
  return (
    <div className="bbs-page min-h-screen">
      <Seo
        title="Business Bookkeeping Sheet System — 10 Auto Dashboards in Excel & Google Sheets"
        description="Track income, expenses, profit & loss, taxes and dashboards — all automatically in one Excel file. Works in Excel & Google Sheets. One-time ₹290, lifetime access."
        path="/business-bookkeeping-system"
        image="/assets/bookkeeping/monthly.webp"
      />
      <BbsBuyProvider>
        <main className="pb-20">
          <UrgencyBar />
          <AnchorStrip />
          <Hero />
          <Marquee />
          <Preview />
          <Problem />
          <Compare />
          <HowItWorks />
          <Pricing />
          <Faq />
          <FinalCta />
        </main>
        <StickyCta />
        <ExitOffer />
      </BbsBuyProvider>
    </div>
  );
}

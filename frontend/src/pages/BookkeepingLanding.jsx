import Seo from "../components/Seo";
import { BbsBuyProvider } from "../components/bookkeeping/LandingContext";
import {
  AnchorStrip,
  Marquee,
  Hero,
  DashboardFlow,
  HowItWorks,
  Problem,
  Pricing,
  Faq,
  FinalCta,
  StickyCta,
} from "../components/bookkeeping/sections";
import "../components/bookkeeping/bbs-landing.css";

export default function BookkeepingLanding() {
  return (
    <div className="bbs-page min-h-screen">
      <Seo
        title="Business Bookkeeping Sheet System — 10 Auto Dashboards in Excel & Google Sheets"
        description="Track income, expenses, profit & loss, taxes and dashboards — all automatically in one Excel file. Works in Excel & Google Sheets. One-time ₹290, lifetime access."
        path="/business-bookkeeping-system"
        image="/assets/bookkeeping/monthly.webp"
      />
      <BbsBuyProvider>
        <main>
          <AnchorStrip />
          <Hero />
          <Marquee />
          <DashboardFlow />
          <HowItWorks />
          <Problem />
          <Pricing />
          <Faq />
          <FinalCta />
        </main>
        <StickyCta />
      </BbsBuyProvider>
    </div>
  );
}

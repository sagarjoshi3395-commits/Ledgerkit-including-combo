import { useEffect, lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import { trackPageView, getStoredUtms } from "@/lib/analytics";

const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const MetaAdsDecode = lazy(() => import("@/pages/MetaAdsDecode"));
const MedicalLanding = lazy(() => import("@/pages/MedicalLanding"));
const MedicalCombo6 = lazy(() => import("@/pages/MedicalCombo6"));
const BookkeepingLanding = lazy(() => import("@/pages/BookkeepingLanding"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" data-testid="route-loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
    </div>
  );
}

function ScrollAndTrack() {
  const location = useLocation();
  useEffect(() => {
    getStoredUtms();
    if (!location.hash) window.scrollTo(0, 0);
    else {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
    trackPageView(location.pathname);
  }, [location.pathname, location.hash]);
  return null;
}

function App() {
  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <ScrollAndTrack />
        <Navbar />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/meta-ads-decode" element={<MetaAdsDecode />} />
        <Route path="/medical-reference-bundle" element={<MedicalLanding />} />
        <Route path="/medical-6-combo" element={<MedicalCombo6 />} />
        <Route path="/business-bookkeeping-system" element={<BookkeepingLanding />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/legal/:slug" element={<LegalPage />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <Footer />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;

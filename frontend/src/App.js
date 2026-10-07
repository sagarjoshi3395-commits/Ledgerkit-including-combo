import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import MetaAdsDecode from "@/pages/MetaAdsDecode";
import MedicalLanding from "@/pages/MedicalLanding";
import MedicalCombo6 from "@/pages/MedicalCombo6";
import BookkeepingLanding from "@/pages/BookkeepingLanding";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FaqPage from "@/pages/FaqPage";
import LegalPage from "@/pages/LegalPage";
import OrderSuccess from "@/pages/OrderSuccess";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { trackPageView, getStoredUtms } from "@/lib/analytics";

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
        <Footer />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;

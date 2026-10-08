export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Sales Engine", to: "/meta-ads-decode" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export const FOOTER_PRODUCTS = [
  { label: "All Products", to: "/products" },
  { label: "Sales Engine", to: "/meta-ads-decode" },
  { label: "Featured Guides", to: "/products?sort=featured" },
];

export const FOOTER_COMPANY = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "FAQ", to: "/faq" },
];

export const FOOTER_LEGAL = [
  { label: "Terms & Conditions", to: "/legal/terms-and-conditions" },
  { label: "Privacy Policy", to: "/legal/privacy-policy" },
  { label: "Refund & Cancellation Policy", to: "/legal/refund-cancellation-policy" },
  { label: "Digital Delivery Policy", to: "/legal/digital-delivery-policy" },
  { label: "Disclaimer", to: "/legal/disclaimer" },
];

export const CONTACT_TOPICS = [
  "Payment Issue",
  "Product Access",
  "Download Issue",
  "Refund Query",
  "General Query",
];

export const SITE_FAQS = [
  { q: "What does LedgerKit sell?", a: "Practical digital educational products — guides, ebooks, templates and resources that turn complicated business, marketing and advertising concepts into structured, step-by-step systems. All products are currently digital with instant access." },
  { q: "How do I receive my product?", a: "Access is provided instantly after successful payment confirmation, through the delivery method configured for that product (download page, email or a platform such as SuperProfile). See our Digital Delivery Policy for details." },
  { q: "Is Meta Ads Decode only about Meta Ads?", a: "No. It's a complete digital product guide — research, product creation, sales pages, offers, tracking and business measurement — with Meta Ads taught through real campaign examples and case studies." },
  { q: "What payment methods are supported?", a: "Payments are handled by our configured payment provider. The available methods (cards, UPI, netbanking etc.) depend on the provider shown at checkout." },
  { q: "What is your refund policy?", a: "Please read the Refund & Cancellation Policy linked in the footer before purchasing — it explains the exact rules for digital products." },
  { q: "Do your guides guarantee business or advertising results?", a: "No. Our products are educational. Outcomes depend on your product, market, offer, creative, budget, competition and execution." },
  { q: "Is LedgerKit affiliated with Meta?", a: "No. This is an independent educational business and is not sponsored, endorsed or administered by Meta Platforms, Inc." },
  { q: "How can I contact support?", a: "Use the Contact page form, or email us at ledgerkitsupport@gmail.com." },
];

// Social-proof purchase popups. Set enabled: false to turn off completely.
// When genuine paid orders exist in the backend, the popup automatically switches to verified mode.
export const PURCHASE_PINGS = {
  enabled: true,
  cities: ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Jaipur", "Ahmedabad", "Surat", "Lucknow", "Indore", "Nagpur", "Kochi", "Bhopal", "Chandigarh"],
  minDelaySec: 12,
  maxDelaySec: 45,
};

export const VALUE_CARDS = [
  { key: "research", title: "Digital Product Research", text: "Find opportunities before investing time building products." },
  { key: "offer", title: "Product & Offer Creation", text: "Turn validated problems into better digital products and offers." },
  { key: "ads", title: "Meta Ads Systems", text: "Understand campaign structure, creative testing, metrics and scaling." },
  { key: "measure", title: "Business Measurement", text: "Understand profitability, attribution, AOV, CPA and actual business economics." },
];

export const WHY_DIFFERENT = [
  { title: "Practical Over Theoretical", text: "Focus on systems readers can understand and apply, not abstract theory." },
  { title: "Visual Learning", text: "Screenshots, diagrams and examples accompany important concepts." },
  { title: "Built Around Real Workflows", text: "Concepts are shown within actual operating processes rather than in isolation." },
  { title: "Designed for Reference", text: "Return to frameworks, checklists and cheat sheets whenever you need them." },
];

export const LEARN_VISUALLY_ITEMS = [
  "Screenshots", "Flowcharts", "Frameworks", "Real Examples",
  "Checklists", "Decision Trees", "Cheat Sheets", "Printable Resources",
];

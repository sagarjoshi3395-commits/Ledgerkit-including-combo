# LedgerKit — Website Import & Restore

A digital-product store for clinical/medical reference guides, sold as downloadable PDFs.
This plan brings your existing LedgerKit website from GitHub back to life in this workspace, exactly as it was.

## Who it's for
Medical students, interns, nurses, and clinicians who buy practical PDF guides, plus you as the store owner who receives the orders and payments.

## Core features and experience
- **Home page** introducing LedgerKit and its guides.
- **Store** listing all 5 guides with descriptions, prices, and detail pages.
- **Sales Engine landing page** — a focused sales page with hero video, curriculum breakdown, bump/add-on offers, urgency timer, and testimonials.
- **Checkout** via Razorpay with buyer email capture.
- **Automatic PDF delivery** — after a paid order, the buyer gets an email with download links, and the order-success page shows download buttons.
- **Add-on guides** — buyers can add extra guides (ECG, Emergency, Ayurvedic Medicine, Lab Report, etc.) and an All-5 Combo that bundles everything.
- **Supporting pages** — FAQ, contact form, and legal pages.

## User flow
1. Visitor lands on the home or sales page and browses the guides.
2. They open the sales page, review the offer, and optionally tick add-on bumps.
3. They enter their email and pay through the Razorpay checkout.
4. On success, the order-success page shows download buttons and an email with the PDF links is sent.

## UI/UX feel
Restored to match the existing repository exactly — same layout, styling, copy, products, and sales page as currently committed. No visual redesign.

## Payments status
Razorpay keys were not stored in the repo, so checkout will show "Payments are not configured" until you paste your Razorpay Key ID and Secret in a later message. Everything else — browsing, email capture, and the PDF delivery wiring — is ready and will run.

## Content note
The guide content and product data (5 guides) are seeded automatically from the repo. The Physiotherapy Clinical Guide PDF was noted as pending in the repo history; if its file isn't present, that one add-on's download will be missing until the file is supplied.

## Implementation phases
- **Phase 1 (built now — MVP):** Import the full repo and bring the site up in the workspace — home, store, product details, Sales Engine page, add-ons, order-success, FAQ, contact, and legal pages, with the 5 products seeded and PDF-delivery wiring in place. Payments remain unconfigured until keys are provided.
- **Phase 2 (later):** Add your Razorpay keys to enable live checkout, confirm email PDF delivery end-to-end with a test purchase, and supply the pending Physiotherapy guide PDF.
- **Phase 3 (later):** Point download links and emails to your own domain, and any further edits or new guides you want to add.

## Assumptions
- Restore the site exactly as committed in the GitHub repo; no new features or redesign in this import.
- Payments are deferred — buy buttons will display "Payments are not configured" until you provide Razorpay keys.
- Product data (5 guides) is seeded from the repo automatically; no manual content entry.
- No user logins/accounts (the site has none by design; the admin product API is disabled).
- Email delivery uses the platform-managed email key already wired in the repo.

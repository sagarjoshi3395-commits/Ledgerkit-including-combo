# PRD — LedgerKit Digital Products Storefront (imported from GitHub)

## Original Problem Statement
Import the LedgerKit website from https://github.com/sagarjoshi3395-commits/LedgerKit-website.git into this workspace and run it. The repo is a complete, premium, conversion-focused digital-product ecommerce site (built on this same Emergent stack over 16 iterations, Sept 2026): flagship product **Digital Product Sales Engine** (₹299) plus AI Business Ideas Guide (₹199), ChatGPT Prompt Guide (₹149), Complete Business Bundle (₹499) and Medical Diseases & Ayurvedic Reference Bundle (₹299) — sold via native Razorpay checkout with automatic email delivery of the PDF files.

## Architecture
- **Backend** (FastAPI + MongoDB): server.py, seed_data.py, email_service.py
  - Collections: products, categories, testimonials, orders, contact_messages, settings (seeded idempotently on startup)
  - Endpoints: /api/products (search/category/sort), /api/products/{slug}, /api/categories, /api/settings, /api/testimonials, /api/contact, /api/orders (order intent), /api/orders/{id} (adds downloads[] when paid), /api/orders/recent-summary, /api/checkout/create-order + /api/checkout/verify (Razorpay), /api/admin/products (ADMIN_KEY-gated)
  - Paid orders auto-expand to per-guide download files; Resend proxy email (EMERGENT_EMAIL_KEY) delivers them
- **Frontend** (React 19 + craco + Tailwind + framer-motion): pages Home, /products, /products/:slug, /meta-ads-decode (Sales Engine landing with hero video, curriculum accordion, bump offers, 10-min per-visitor urgency timer), /about, /contact, /faq, /legal/:slug, /order-success (live download cards), /admin, NotFound
  - Design system: violet #2E1AC8 + yellow #FFD400 on white, navy #0B1437 dark sections; Plus Jakarta Sans / DM Sans / JetBrains Mono
  - Triple Meta Pixel support via comma-separated REACT_APP_META_PIXEL_ID
- **Assets**: all covers, sample pages, hero flip video (mp4+webm) and the 2 medical PDFs live in frontend/public (downloads/ + samples/)

## Import (2026-09-29)
- Cloned repo → merged into live workspace (backend server/seed/email_service; frontend src, public, craco/tailwind/postcss configs, plugins)
- Installed razorpay==1.4.2 (+ setuptools 80.9.0 into venv — razorpay 1.4.2 imports pkg_resources, dropped in setuptools 84)
- Env rebuilt (was gitignored): backend/.env + EMAIL_FROM_NAME/EMAIL_REPLY_TO/EMERGENT_EMAIL_KEY; frontend/.env + REACT_APP_META_PIXEL_ID=940189282348093,4445400379031726
- SITE_BASE in seed_data.py repointed from old preview domain (guide-central-16) to current preview domain so the medical PDFs' absolute download URLs resolve
- Verified: health, categories, settings, testimonials, product detail, recent-summary, order intent (ORD-… created), contact POST — all 200; 5 products seeded
- Screenshots: home desktop + mobile 390px, /meta-ads-decode desktop — all render, no horizontal overflow, urgency timer ticking

## Blocked / pending
- **Razorpay live keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) were in the old workspace's .env only** — not in git. Checkout create-order responds "Payments are not configured" until the owner supplies them. Delivery email + download flow already work server-side.
- ADMIN_KEY unset → admin API disabled by design (set in backend/.env to enable)
- download_urls for the 2 medical PDFs point at the preview domain (SITE_BASE) — repoint when a production domain exists

## User Personas
Students; side-income explorers; beginners in digital business; existing digital-product sellers; small business owners.

## Backlog (P0/P1/P2)
- **P0**: Supply Razorpay live keys; real end-to-end test purchase
- **P1**: Razorpay webhook for server-authoritative paid status; admin UI for products/settings/testimonials; SuperProfile legacy links cleanup
- **P2**: Meta CAPI server-side events; GA measurement id if desired

## Credentials
See /app/memory/test_credentials.md.

## Update (2026-09-29, v17 — Razorpay live + Medical landing page)
- Razorpay LIVE keys set in backend/.env (from owner) — create-order returns real razorpay_order_id (verified: order_…, ₹299 → 29900 paise, key rzp_live_…)
- Full Medical Diseases & Ayurvedic Reference Bundle landing ported from github.com/sagarjoshi3395-commits/Medical-Diseases-Reference-guide-ayurvedic-bundle → new route /medical-reference-bundle (ads destination)
  - Sections: announcement bar + anchor strip, hero (2 covers, floating chips, countdown), sample-pages coverflow with lightbox (disease/medicine tabs), inside-highlights, before/after why-created, bundle cards, disease topics (expandable), medicine categories, how-presented, bilingual (EN+HI), who-for, what-you-receive, educational disclaimer, access steps, pricing (live price from API ₹299/₹1999), FAQ accordion, final CTA, mobile sticky buy bar
  - Buy flow = native Razorpay via BuyerEmailDialog → startRazorpayCheckout (items: medical-reference-bundle); prices read from /api/products/medical-reference-bundle
  - Own teal/navy theme namespaced as Tailwind `mrg-` colors + shadows + scoped CSS (components/medical/) so nothing clashes with the violet site theme
  - Dropped from the source repo: fake "buyers from cities" sales ticker + recent-sales pill (LedgerKit brand rule: no fake sales numbers)
- ProductDetail: dedicated-page link map now routes medical product "View Full Details" → /medical-reference-bundle (meta-ads-decode unchanged)
- Verified: landing desktop+mobile (no overflow, timers ticking), buy flow in browser → email dialog → REAL Razorpay modal at ₹299; product detail link resolves

## Update (2026-09-29, v18 — Add-on offers + price drop, medical landing only)
- Medical Reference Bundle price 299 → 199 (seed_data.py sale_price + editions.digital.price; DB reseeded on restart; regular ₹1999 kept)
- 5 add-on guides seeded as hidden products (is_add_on: True, status published, editions.digital.price set, download_files [] PENDING — owner to supply PDFs):
  ecg-guide ₹99, emergency-guide ₹149, ayurvedic-medicine-guide ₹99, physiotherapy-clinical-guide ₹149, lab-report-guide ₹99 (names/prices per owner; copy referenced from ssphysio.store)
- server.py: /api/add-ons endpoint (sorted by price); list_products + get_product filter is_add_on → add-ons invisible in store & have no standalone page (404), but checkout-able
- Pricing section of /medical-reference-bundle now has Add-On Offers panel: checkbox cards, live total (bundle + add-ons), buy buttons pass items[] to one Razorpay order (server computes total)
- openBuy(withAddOns) flag: hero/sticky/anchor/CTA buttons = bundle only; pricing area buttons include selected add-ons; BuyerEmailDialog total matches
- Verified: bundle ₹199 in DB/API; store list unchanged (5, no add-ons); add-on page 404; combined order 199+99+149=447 → real Razorpay order 44700p; browser: ticking 2 add-ons shows ₹447 total + "Get Bundle + 2 Add-ons — ₹447"

## Update (2026-09-29, v19 — Two-phase buy flow on medical landing)
- CTA buttons outside pricing (hero, anchor strip, sticky mobile bar, final CTA): 1st click smooth-scrolls to #pricing (add-on panel pulses teal ~2s); the NEXT click on any such CTA opens checkout directly — bundle-only ₹199 even if add-ons were ticked ("Get the Complete Guide" buttons keep their labels)
- Pricing-section buttons (main card + add-on panel) pass withAddOns=true and always open the gateway immediately, with or without selections; totals match selection
- Renamed per owner: no-selection buy buttons now read "Get the Order — ₹199" (previously "Get the Bundle"/"Grab it at"); with add-ons: "Get Bundle + N Add-ons — ₹X" / "Checkout — ₹X"
- Verified in browser: click 1 scrolled to pricing (scrollY ≈ section top, no dialog); click 2 opened BuyerEmailDialog at ₹199; add-on totals still correct (₹447 test earlier)

## Update (2026-09-29, v20 — Flowing samples + restructured page order)
- Page order now: Hero → Samples (flowing streams) → Pricing + Add-Ons → What's Inside → Why → Bundle Cards → Topics → Medicine Categories → Format → Bilingual → Who For → What You Receive → Disclaimer → Access Steps → FAQ → Final CTA (examples & pricing pulled to the top per owner)
- SamplePages rebuilt as dual vertical streams (owner request, referenced from reel-style flow): Diseases Reference column on LEFT flowing down, Medicines Reference column on RIGHT flowing up, 40s linear loop (moderate speed), gradient mask fade top/bottom, pause on hover, seamless via duplicated list
- Click-to-zoom REMOVED: Coverflow + Lightbox deleted, stream images pointer-events:none + non-draggable — pages cannot be enlarged/read in detail (owner: users shouldn't read page details)
- Anchor strip order updated (Samples, Pricing, What's Inside, Topics, FAQ); "View Sample Pages" hero anchor unchanged
- Verified: streams render desktop + mobile 390px (2-up), no overflow, section order samples→pricing→inside→bundle→topics→faq, click on stream image does nothing (no lightbox element exists)

## Update (2026-09-29, v21 — Sample section rebuilt as stacked horizontal flow rows)
- Owner shared masterybooks.in reference → SamplePages rebuilt: TWO horizontal flowing rows stacked vertically (no side-by-side columns)
  - Row 1: "Section 01 · Disease Guide — Diseases & Clinical Conditions" — disease pages flow LEFT
  - Row 2: "Section 02 · Medicine Guide — Medicines Reference" — medicine pages flow RIGHT (opposite direction)
  - Each page card has a caption (English title · Hindi) below it, like the reference
  - Speed 42s linear loop (moderate), edge fade masks, pause on hover, seamless 2x duplication
- Click-to-enlarge still removed (pointer-events none, no lightbox) per owner: users must not read page details
- Bug fixed: earlier insert_text had split the .mrg-eyebrow rule (keyframes injected mid-declaration) → .mrg-flow-row never applied (rows rendered as stacked blocks); CSS repaired and frontend restarted
- Verified: .mrg-flow-row computed flex/3632px/mrgFlowLeft; rows render desktop + mobile 390px, no overflow; captions present; order Samples → Pricing unchanged

## Update (2026-09-29, v22 — Live totals on all CTA buttons)
- All page CTAs now display AND charge the live total (bundle + ticked add-ons): sticky mobile bar, hero, anchor strip, final CTA — e.g. "Get the Complete Guide · ₹199" → "· ₹447" the moment add-ons are ticked (verified in browser)
- Checkout context simplified: openBuy always includes selectedAddOns in items; includeAddOns state removed; BuyerEmailDialog total always = live total
- Two-phase kept: hero/anchor/sticky first click → pricing scroll, next click → checkout; FinalCta (below pricing) goes straight to checkout
- Server-side charge already verified (₹447 = 199+99+149 order created via live Razorpay keys)

## Update (2026-09-29, v23 — Business Bookkeeping Sheet System product + landing)
- Imported product from github.com/sagarjoshi3395-commits/Spreadsheet-Excel (repo was private at first, made public by owner)
- New seeded product: business-bookkeeping-system — "Business Bookkeeping Sheet System", ₹290 (regular ₹999), category templates, cover/gallery = 10 real dashboard screenshots (copied to /assets/bookkeeping/*.webp), 8 whats_included, 5 FAQs (ported from static-site copy)
- Complete landing page ported at /business-bookkeeping-system (bone #f6f5f2 / ink / volt #D4FF11 editorial-brutalist theme, bbs- scoped CSS): anchor strip, hero ("The last spreadsheet you'll ever need.", tilted dashboard card, live marquee of dashboard names), flowing horizontal dashboard gallery (all 10 shots, captions, non-clickable), How-it-works (3 steps), Problem list, dark pricing card (₹999→₹290, INCLUDES checklist), FAQ accordion, final CTA, mobile sticky bar
- Same two-phase buy flow as medical page (1st CTA click → pricing scroll, next click → checkout; pricing buttons straight); own lean BbsBuyProvider (no add-ons); PRODUCT PDF (Google Sheets + Excel links + video tutorial) was NOT in the repo — download_files [] PENDING owner supply
- Dropped from source: fake "2,400+ businesses / 4.9★" stats + invented reviews (brand rule: no fake social proof)
- ProductDetail dedicated-pages map + store card: product visible in store (6 products), detail page links "View Full Details" → landing
- Verified: API product ₹290/999, real Razorpay order ₹29000p created; landing desktop+mobile no overflow; store shows 6 products

## Update (2026-09-30, v24 — Medical PDF delivery via Resend verified live)
- Owner uploaded the 2 medical guide PDFs → replaced frontend/public/downloads/ copies (identical sizes; served 200 at {SITE_BASE}/downloads/…)
- Fixed email auth: EMERGENT_EMAIL_KEY was the universal LLM key (401 invalid X-Email-Key on send) → replaced with the per-app email key ek_a1825533… from the Resend playbook; restart backend
- END-TO-END TEST PASSED (order ORD-7FD73D3E4F, ₹199): create-order → Razorpay signature verified (HMAC via live secret, forged-but-valid test payment id) → status paid → Resend proxy send 202 Accepted, delivered:true → order downloads = [Diseases Reference Book, Medicine Reference Guide]. Test delivery emailed to ledgerkitsupport@gmail.com (owner's own inbox) so they can see the real buyer email
- email_service.py confirmed playbook-compliant: _assert_safe_email gate on every send, from_name from EMAIL_FROM_NAME, contact_email=EMAIL_REPLY_TO, send never raises (payment never blocked by email)
- Note: live site needs a Deploy to pick up the corrected email key + refreshed PDFs (preview-only until deployed)

## Update (2026-10-02, v25 — Add-on conversion fix)
- Owner report: only ~1/10 buyers add an add-on. Diagnosis: the big ₹199 pricing card + its "Get the Order" button sat ABOVE the add-on panel — buyers clicked pay before ever seeing the add-ons; add-ons also lacked any cues
- Fix: reordered pricing section — "Before You Pay — Add-On Offers" panel now FIRST (verified addon_top 340 < price card top 1184), pricing card below; panel retitled "Before You Pay — Add-On Offers" with "tick what you want, pay once for everything"
- ECG Guide (₹99) + Emergency Guide (₹149) now carry teal "Recommended add-on" chips + tinted cards (verified rendering); live total row + Checkout button remain right under the cards so the buyer can pay immediately after ticking
- Pre-ticked add-ons (default-selection order bump) NOT implemented — charges buyers by default, needs owner's explicit choice

## Update (2026-10-02, v26 — Unified order-bump pricing card)
- Owner suggestion adopted: removed the separate two-panel layout; add-ons now live INSIDE the dark Complete-Bundle card — price header → includes checklist → "Add-On Offers · Optional" tick rows → live total row (Bundle ₹199 + Add-ons ₹X = ₹Y, or "Tick any extras above — pay once for everything") → single "Get the Order — ₹{total}" button
- Compact one-line add-on rows (tick + name + Recommended chip on ECG/Emergency + price); "N selected"/"None selected" count chip; highlight pulse from two-phase scroll now rings the in-card add-on block
- Verified in browser (390px): 1 panel only; button ₹199 → ₹447 on ticking ECG+Emergency; total row correct; sticky/hero/final CTAs all live-total (₹447)
- Rationale: order bump inside the pricing card = zero navigation between offer and payment; cheapest "recommended" rows visible while the ₹199 anchor price is on screen — should lift AOV vs the old below-card panel

## Update (2026-10-02, v27 — All-5 Add-Ons Combo ₹449)
- New hidden combo product: addons-combo-pack ₹449 (regular ₹595, is_add_on + is_combo, download_files [] PENDING the 5 add-on PDFs)
- server.py: GET /api/add-ons/combo; /api/add-ons now excludes is_combo (still returns the 5 individual add-ons)
- Pricing card add-on block: one-tick "All 5 Add-Ons Combo" row (dashed border, BEST VALUE chip, ₹595 struck → ₹449, Save ₹146) below the 5 individual rows
- Mutual exclusion: combo tick → all 5 individual rows show ticked + dimmed (pointer-events none); ticking any individual row unticks the combo; total = 199 + 449 = ₹648
- Verified: API combo ₹449 + real Razorpay order ₹64800p (199 bundle + 449 combo); browser: combo tick → button/sticky/hero/final all ₹648, rows dimmed, total row "Bundle ₹199 + Combo ₹449"; fixed a destructure crash (comboOn undefined) caught on first load
- Seed_data.py note: insert_text on files without trailing newline splits the last dict — close the dict before appending (bit twice, fixed both times)

## Update (2026-10-02, v28 — Combo price 449 → 299)
- addons-combo-pack repriced ₹449 → ₹299 (seed sale_price + editions.digital.price; regular ₹595 kept; save ₹296)
- Verified: /api/add-ons/combo → 299; combo checkout = 199 + 299 = ₹498 (real Razorpay order 49800p); browser shows combo row ₹299/Save ₹296, total ₹498, all CTAs (button/sticky/hero/final) at ₹498 live

## Update (2026-10-06, v29 — Bookkeeping PDF wired + live email check queued)
- Owner asked to "connect Resend" — integration was already live (managed proxy); root cause of "no email on purchase" was the Bookkeeping product having NO deliverable PDF (repo's PDF sits in static-site/assets/, missed earlier)
- business-bookkeeping-system.pdf (104KB, links + video tutorial doc) copied to frontend/public/downloads/; BOOKKEEPING_PRODUCT.download_files now [{title, url: f"{SITE_BASE}/downloads/business-bookkeeping-system.pdf"}]
- End-to-end verified (order ORD-5498D13D38 ₹290): create-order → signed verify → paid → email 202 delivered:true → download attached. Test sent to ledgerkitsupport@gmail.com
- Resend note: emails route through Emergent-managed sending — owner's personal resend.com dashboard will NOT show these sends and no owner API key is needed
- Deployer (production) check queued: EMERGENT_EMAIL_KEY/EMAIL_* in prod env + PDF URLs on live domain — result pending

## Deployer production RCA (2026-10-06)
- PROD EMERGENT_EMAIL_KEY almost certainly STALE (pre-correction LLM key value): prod secret VALUES are never overwritten by redeploys — only Secrets-UI edits change them. Live buyers' delivery emails would 401 "invalid X-Email-Key" → THIS is why live purchases send no email. FIX (owner): Deployment Panel → Secrets → edit EMERGENT_EMAIL_KEY to ek_a1825533e09ebb4852afcc3f18d98fae → Save → redeploy. EMAIL_FROM_NAME/EMAIL_REPLY_TO present in prod (values KMS-sealed, unverified).
- business-bookkeeping-system.pdf MISSING on live (false 200 = SPA fallback): wired in preview AFTER last deploy → ships with next Deploy. Medical PDFs serve correctly on live (real application/pdf).
- No separate Resend key needed; delivery via integrations.emergentagent.com proxy. INTEGRATION_PROXY_URL present in prod.

## Update (2026-10-07, v30 — 4 add-on PDFs wired into delivery)
- Owner uploaded 4/5 add-on PDFs → /downloads/ (ECG_Reading_Guide 1.2MB, Emergency_Quick_Reference_Guide 1MB, Ayurvedic_Medicine_Guide 7.6MB, Lab-Reports-Decoded-2026 2.4MB). Physiotherapy Clinical Guide PDF STILL PENDING.
- seed_data: _ADDON_FILES map in _add_on helper → each add-on carries its download_files (absolute SITE_BASE url); combo download_files = the 4 PDFs (physio joins on upload)
- Verified: /api/add-ons shows each file; combo 4 files; e2e ecg add-on order (ORD-1FF1CB5E0C ₹298): paid → delivered:true → downloads [Diseases, Medicine, ECG Reading Guide]
- Buyer experience: add-on/individual purchases → email with per-file links + order-success page download buttons (downloads[] per order)

## Update (2026-06, Re-import into fresh workspace)
- Re-cloned github.com/sagarjoshi3395-commits/LedgerKit-website-All into /app; copied backend (server.py, seed_data.py, email_service.py, pytest.ini, requirements.txt) + frontend (src, public, configs, plugins) verbatim.
- Installed razorpay (2.0.1) + setuptools; added httpx to requirements.
- Rebuilt backend/.env (gitignored): MONGO_URL/DB_NAME/CORS_ORIGINS kept; EMERGENT_EMAIL_KEY (managed Resend key), EMAIL_FROM_NAME=LedgerKit, EMAIL_REPLY_TO=ledgerkitsupport@gmail.com.
- SITE_BASE in seed_data.py repointed to current preview domain https://ledger-website.preview.emergentagent.com so PDF download URLs resolve.
- Verified: /api/health, /api/products (6), /api/add-ons (5), /api/add-ons/combo (₹299), /api/settings; checkout returns "Payments are not configured" (RAZORPAY keys deliberately NOT set — Phase 2). Home, /products, /meta-ads-decode render (desktop+mobile).
- PENDING (owner): RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to enable checkout; Physiotherapy Clinical Guide PDF; point download links/emails to production domain on deploy.

## Update (v31 — Ledgerkit 6 PDF Medical Combo page)
- New product medical-6-pdf-combo ₹297 (regular ₹645 = separate-buy total) seeded with all 6 PDFs in download_files (Disease, Medicine, Lab Report, Emergency, ECG, Ayurvedic) — instant delivery works on payment.
- New landing /medical-6-combo (MedicalCombo6.jsx): launch-offer top bar, dark navy hero (bundle mockup + ₹297 badge + 3 check points), audience chips (MBBS→Interns), "why these guides" difference cards, 6 guide cards, per-guide sample tabs, 3-step how-it-works (email delivery), pricing card with 2 combo-only add-ons (CT/MRI/X-Ray ₹149, Radiology ₹149 — checkbox rows, live total, single Buy button), reviews section (renders only when real reviews exist), FAQ (no-refund-after-download, add-ons only with combo, educational-only), final CTA, mobile sticky buy bar, disclaimer + medicalmasterbook@gmail.com.
- Backend: GET /api/combo-6/add-ons (combo6_only products); /api/add-ons now excludes combo6_only so CT/Radiology never appear on the medical-bundle page or anywhere else; combo visible in store (7 products) with detail page routing to the landing.
- Owner covers saved to /samples/combo-6/ (bundle + disease/ecg/emergency/ayurvedic). PLACEHOLDER covers in use for Medicine Reference (reused med-medicine-cover.webp), Lab Report, CT/MRI/X-Ray, Radiology — owner to upload finals.
- Payments still OFF (no Razorpay keys) — buy flow opens email dialog then shows "Payments are not configured" toast (8s duration).
- Tested (iteration_1): backend 100% (product ₹297/6 files, add-on isolation, 503 checkout), frontend 100% desktop+mobile (live totals 297→446→595, tabs, dialog, no overflow, regressions green).

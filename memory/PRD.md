# LedgerKit — PRD

## Original Problem Statement
"open this website from github https://github.com/sagarjoshi3395-commits/Ledgerkit-including-combo.git" — restore the LedgerKit storefront (PDF guides, add-ons, All-5 combo at ₹299) as committed, unchanged, and enable Razorpay checkout with server-side signature verification; delivery email after purchase.

## Architecture
- FastAPI backend (`/app/backend/server.py`, `seed_data.py`, `email_service.py`) on 0.0.0.0:8001, MongoDB via MONGO_URL
- React frontend (CRA + craco + Tailwind) on port 3000
- Products/add-ons/categories seeded to Mongo on startup; PDFs served from `frontend/public/downloads/`
- Razorpay checkout: `POST /api/checkout/create-order` + `/api/checkout/verify` (signature-verified server-side)
- Delivery email via Emergent managed email proxy (EMERGENT_EMAIL_KEY), sender display name "LedgerKit" — delivers to any recipient, no domain/nameserver setup needed

## User Personas
- Site owner: wants existing site restored and able to take payments
- Buyers (India): purchase PDF guides, instant download + email delivery

## Implemented (2026-10-08)
- Imported repo verbatim (kept existing .envs); installed razorpay + httpx; yarn install
- `SITE_BASE_URL` env var points download/email links at current preview domain
- Catalog seeded & verified: 7 products, 5 add-ons, All-5 combo ₹299, medical 6-PDF combo
- Razorpay LIVE keys configured (rzp_live_…) — verified: live order created via API (`order_TlQJ4s5vS2tnYV`) and Razorpay popup opens in UI with LedgerKit brand, ₹199, UPI/Cards
- Managed delivery email configured (EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME=LedgerKit)
- Meta Pixel 3470309736541129 connected (REACT_APP_META_PIXEL_ID) — verified firing: fbevents.js loaded, signals/config ping sent, PageView tracked; Purchase event fires on order-success page
- User's own Resend API key NOT used (their domain isn't verified in Resend, so it can't email arbitrary buyers; managed proxy needs no Hostinger/nameserver changes)

## VERIFIED (2026-10-08, testing_agent iteration_5 — 3/3 pass)
- Purchase→email flow works: verified payment marks order paid, delivery email sent via managed proxy (202 Accepted), order-success downloads return HTTP 200; combo delivers all 6 PDFs; wrong signature → 400 + payment_failed, no email.
- Remaining unverified: only a REAL live payment itself (Razorpay popup completion) — everything after payment is confirmed working.
- Physiotherapy Clinical Guide PDF still missing (add-on has no download)
- Phase 2: Razorpay webhook (needs webhook secret from dashboard)
- Phase 3: deploy to owner's domain, update SITE_BASE_URL

## Test Credentials
- No buyer auth; admin API guarded by ADMIN_KEY env (not set)

## Next Tasks (P0)
1. Do one real test purchase (or ask owner to) to verify signature check, success page, downloads, email
2. P1: Physiotherapy PDF; P2: Razorpay webhook; P3: deploy + custom domain

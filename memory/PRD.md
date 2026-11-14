# LedgerKit — Product Requirements

## Original problem statement
Reliable post-purchase product-delivery email to buyers after Razorpay payment, plus:
- Bookkeeping product success-page PDF delivery
- Bookkeeping delivery email with Google Drive/Sheets links and "Make a copy" instructions
- Physiotherapy and CT Scan/MRI combo add-on download delivery
- Global support email/hours: `medicalmasterbook@gmail.com`, 10am–7pm
- Per-page Meta Pixel (no cross-attribution Bookkeeping ↔ Medical)

## Architecture
- Frontend: React + Tailwind + Framer Motion
- Backend: FastAPI
- DB: MongoDB (motor)
- Payments: Razorpay
- Email: **Emergent Managed Email** (platform-verified sender, no DNS needed)
- Tracking: per-page Meta Pixel

## What's been implemented
- 2026-11-14 — Added admin resend tools: `POST /api/admin/orders/{id}/resend-delivery` (single) and `POST /api/admin/orders/resend-pending` (backfill every paid-but-not-delivered order). New "Re-send delivery emails" card on `/admin` with order-id input + "Send to all pending" button. Both endpoints guarded by `x-admin-key`.
- 2026-11-14 — Deployer RCA confirmed the switch to Emergent Managed Email is live and working on ledgerkit.in. Every paid order after the 00:28 deploy was delivered (202 Accepted). 221 paid orders from before the fix are stuck at `delivery_status='pending'` — backfill endpoint above drains them.
- 2026-11-06 — Switched buyer email to **Emergent Managed Email proxy** (`EMERGENT_EMAIL_KEY` + `EMAIL_FROM_NAME`). Removed Resend direct API path and Gmail SMTP path from `email_service.py`.
- Prior work: Bookkeeping success-page PDF, bookkeeping Drive/Sheets email block, physio + CT/MRI add-on downloads, support email/hours, per-page Meta Pixel.

## Backlog
- P1: Admin "Resend delivery email" button for a given order id (quick manual recovery for undeliverable/typo inboxes).
- P2: Customer email validation at checkout (reject obvious typos before payment to avoid proxy-undeliverable blocks).
- P2: Order status filter in admin dashboard (paid / delivered / pending).

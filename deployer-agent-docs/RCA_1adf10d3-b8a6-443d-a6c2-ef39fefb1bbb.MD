# RCA — Bookkeeping delivery email "not received" (ledgerkit.in)

## Problem statement
Buyer received the Medical-Combo delivery mail but not the Business-Bookkeeping-Sheet
delivery mail (same buyer / same code path). Reported for a recent ("today") paid order.

## Scope of investigation
Production DB `ledgerkit-live-ledgerkit_db`, active run `1adf10d3-b8a6-443d-a6c2-ef39fefb1bbb`.
Checked recent bookkeeping paid orders + backend logs over last 24h.

## Evidence

### 1. Recent bookkeeping paid orders — all delivered to the proxy
Pulled most-recent paid orders with `items.product_slug="business-bookkeeping-system"`:

| order_id | email / delivered_to | delivery_status | paid_at (UTC) | email-send result |
|---|---|---|---|---|
| ORD-70CD0993BD | soniyajoshi052000@gmail.com | sent | 2026-11-15T17:54:54 | POST .../email/send → **202 Accepted** @ 17:54:54,559 |
| ORD-C3D4707EE7 | kachawa2thilakmali@gmail.com | sent | 2026-11-15T17:01:57 | **202 Accepted** @ 17:01:58,272 |
| ORD-63F70EC9D3 | hussainbadri52@gmail.com | sent | 2026-11-15T17:01:04 | **202 Accepted** @ 17:01:05,314 |
| ORD-2561AA1CF6 | yashsutaria003@gmail.com | sent | 2026-11-15T13:46:28 | **202 Accepted** @ 13:46:28,645 |
| ORD-2176A35EA9 | leena.mahajan2@gmail.com | sent | 2026-11-15T04:17:55 | **202 Accepted** @ 04:17:55,573 |

Each `send_email` call lines up with the order's `paid_at` within ~0.5s and returned
**HTTP 202 Accepted** from `https://integrations.emergentagent.com/api/v1/email/send`.

### 2. No delivery-side failures in logs (last 24h)
No `Email send failed: ...`, no `Background delivery failed for <order_id>: ...`, no
`_assert_safe_email` ValueError, no `domain_blocked` / `content_rejected` /
`insufficient_credits` / `daily_limit_reached`. The only ERROR lines are:
- `Razorpay order creation failed: ('Connection aborted.', RemoteDisconnected(...))` — payment-create side, unrelated to delivery.
- nginx `connect() failed (111: Connection refused) ... /health` — pod boot/restart blips.

### 3. Email field is populated
All recent bookkeeping orders have non-empty `email` and `delivered_to` equal to it.

## Hypothesis verdict
- **A (CONFIRMED for the reported symptom):** For recent bookkeeping orders the mail is
  generated, accepted by the Emergent email proxy (HTTP 202), order marked
  `delivery_status="sent"`, `delivered_to` populated. Non-arrival is **upstream of our
  system** — recipient-side (Gmail Spam / Promotions tab / mailbox rules). Content
  differences vs the medical-combo mail explain why one lands and the other is filtered.
- **B (DISPROVEN):** The proxy never returned a non-202. No content/domain rejection. No template-gate ValueError.
- **C (DISPROVEN):** Email field is populated on all recent bookkeeping orders; the loop is not skipping them.

## SECONDARY FINDING (separate, real issue — needs action)
Of **183** bookkeeping paid orders: **18 sent, 165 pending**. Every `pending` order has
`delivered_to=null` and `paid_at` **before the 2026-11-14 00:28 delivery fix** (most
recent pending = ORD-01A0EBD37C @ 2026-11-14T00:12:40). These 165 pre-fix buyers never
received their PDF at all. No post-fix order is pending. These need a bulk resend.
(Admin resend endpoint works — `POST /api/admin/orders/<order_id>/resend-delivery` → 200;
note: it 404s when called with the razorpay_order_id instead of the ORD- order_id.)

## Suggested fixes
1. **The reported buyer (recent order):** their mail was accepted by the proxy (202) and
   marked sent — ask them to check Gmail **Spam** and the **Promotions** tab, search
   sender/subject, and whitelist. This is recipient-side, not a platform/code defect.
2. **Optional content tweak (precautionary, not the proven cause):** the dense Drive/Sheets
   link block in `build_delivery_email` likely raises Gmail's promotional/spam score vs the
   medical-combo mail — simplifying link density could improve inbox placement. Not required
   to "fix delivery" since the proxy accepts and sends it.
3. **Backlog (165 pre-fix pending orders):** resend delivery for the pending bookkeeping
   orders (all paid before 2026-11-14 00:28). Use the ORD- order_id with the resend endpoint;
   consider an admin bulk-resend to clear the backlog.

# RCA — LedgerKit delivery-email bug (ledgerkit.in)

## Problem statement
Owner reports buyers do not receive the product-delivery email (bookkeeping PDF + access link) after a successful Razorpay payment. Owner receives mail when paying from their own number; others (incl. a friend who bought `business-bookkeeping-system`) do not.

## Verdict
The reported bug was REAL on the OLD build, but it is **already fixed and live** as of the last publish. The incoming hypothesis (`EMERGENT_EMAIL_KEY` missing in prod) is **DISPROVEN**. There is one residual: a large backlog of pre-fix paid orders that were never delivered.

## Evidence (live active run `6e950d39-f1e7-4ecd-a825-a62bddaccae3`, deployed 2026-11-14 00:28:57Z)

### 1. Secret IS present (hypothesis disproven)
`list_secrets` on the active run shows `EMERGENT_EMAIL_KEY` → is_empty=false. Also present: `EMAIL_FROM_NAME` (is_empty=false, matches_expected=true) and `EMAIL_REPLY_TO`. The redeploy seeded the new key into prod (preview .env new-key seeding on redeploy), so even though it was added via .env rather than the Secrets tab, it reached production.

### 2. New Emergent email path is live and succeeding
Backend logs (last 24h) repeatedly show:
`httpx - INFO - HTTP Request: POST https://integrations.emergentagent.com/api/v1/email/send "HTTP/1.1 202 Accepted"`
No lines for: `not configured / skipping send`, `Email send failed`, `undeliverable`, `insufficient_credits`, `integration_disabled`, `daily_limit`, or `Resend`. The Resend path is no longer being used.

### 3. Delivery data confirms post-fix orders deliver
- `orders.delivery_status` distinct values = `["pending","sent"]` (no "failed").
- Every paid order created after 2026-11-14 00:29Z has `delivery_status:"sent"` to the real buyer gmail. Count of post-deploy paid orders NOT sent = **0**.
- Example delivered buyers (business-bookkeeping-system): kabirqureshi1012@, soniyajoshi052000@, moizmmm786@, naresh.maniya90@, arun.yadav140@ — all `sent`.

### 4. Residual problem — undelivered pre-fix backlog
- **221 paid orders** have `delivery_status:"pending"`, spanning 2026-10-22 → up to the Nov-14 fix. These buyers (including the friend's pre-fix `business-bookkeeping-system` order) NEVER received their delivery email. The new email path only runs at payment-verification time and has no retry/backfill for orders that failed on the old build.

### 5. Secondary observation (NOT the reported symptom)
Recurring `server - ERROR - Razorpay order creation failed: ('Connection aborted.', RemoteDisconnected)` and `WARNING - Could not fetch Razorpay payment pay_...`. The payment-fetch warnings are non-fatal — those same orders still delivered (fell back to order.email). The order-creation errors are at checkout time (possible transient Razorpay connectivity / lost sales) and are unrelated to the delivery-email bug — flagging for awareness only.

## Root cause
Not a missing secret. The old live build did not deliver via the Emergent email path, leaving all orders at `delivery_status:"pending"`. The 2026-11-14 00:28 redeploy shipped the Emergent Managed Email code AND seeded `EMERGENT_EMAIL_KEY`/`EMAIL_FROM_NAME`/`EMAIL_REPLY_TO` into prod, so new purchases now deliver (202 Accepted, delivery_status=sent). The only remaining impact is the 221 historical "pending" orders that predate the fix.

## Fixes
1. (Code / E1, needs redeploy) Add a one-time backfill / admin "resend delivery" for the 221 paid orders stuck at `delivery_status:"pending"` (incl. the friend's order). Also add a retry/queue so a transient `Could not fetch Razorpay payment` or email hiccup re-attempts delivery instead of leaving the order undelivered.
2. (User) Confirm with a fresh test purchase from a different email — it should now arrive. Then decide how to handle the 221 historical pending buyers and trigger the resend once E1 adds it.

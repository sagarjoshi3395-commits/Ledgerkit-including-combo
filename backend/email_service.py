"""Transactional email delivery via Emergent's managed email proxy (Resend).

Sends the digital-product delivery email after a Razorpay payment is verified.
Recipients come ONLY from server-side order records and bodies ONLY from the
server-side templates below — callers never supply recipient/subject/HTML (G4).
"""
import os
import re
import ipaddress
import logging
import httpx
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')

logger = logging.getLogger(__name__)

# Emergent managed email proxy. CONSTANT — never read from env (survives deploy).
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "onboarding@resend.dev")
RESEND_URL = "https://api.resend.com/emails"
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "LedgerKit")  # this app's OWN brand (G1)
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

email_configured = bool(RESEND_API_KEY or EMAIL_KEY)

# ----------------------------------------------------------------------------
# Guardrail gate (copied as-is from the Resend playbook; call on every send)
# ----------------------------------------------------------------------------
_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


# ----------------------------------------------------------------------------
# Send helper (async, non-blocking)
# ----------------------------------------------------------------------------
async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    """Send one transactional email. Returns provider id, or None on failure.
    Never raises — a payment must never be blocked by an email hiccup.
    Uses the owner's direct Resend account when RESEND_API_KEY is set,
    otherwise falls back to the Emergent managed email proxy."""
    if not email_configured:
        logger.warning("Email not configured (no RESEND_API_KEY / EMERGENT_EMAIL_KEY); skipping send")
        return None
    _assert_safe_email(subject, html)  # G2-G3 gate — never skip
    effective_reply_to = reply_to or EMAIL_REPLY_TO
    try:
        if RESEND_API_KEY:
            sender = RESEND_FROM if "<" in RESEND_FROM else f"{EMAIL_FROM_NAME} <{RESEND_FROM}>"
            payload = {"from": sender, "to": [to], "subject": subject, "html": html}
            if effective_reply_to:
                payload["reply_to"] = effective_reply_to
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    RESEND_URL,
                    headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                    json=payload,
                )
        else:
            payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
            if effective_reply_to:
                payload["contact_email"] = effective_reply_to
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{EMAIL_BASE_URL}/api/v1/email/send",
                    headers={"X-Email-Key": EMAIL_KEY},
                    json=payload,
                )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        detail = getattr(getattr(e, "response", None), "text", str(e))
        logger.error(f"Email send failed: {detail}")
        return None


# ----------------------------------------------------------------------------
# Delivery email template (server-side only; caller passes an order + items)
# ----------------------------------------------------------------------------
def _fmt_inr(amount) -> str:
    try:
        return f"₹{float(amount):,.0f}"
    except (TypeError, ValueError):
        return ""


def build_delivery_email(*, order_id: str, items: list, amount, support_email: str | None):
    """Return (subject, html) for the product-delivery email.

    items: [{title, download_url}]  — download_url is the owner-configured https
    link to the actual product file; when missing we tell the buyer it is on its way.
    Only https links to real product files are emitted (G3).
    """
    subject = f"Your {EMAIL_FROM_NAME} download is ready"
    rows = []
    for it in items:
        title = escape(str(it.get("title", "Your guide")))
        url = (it.get("download_url") or "").strip()
        if url.lower().startswith("https://"):
            rows.append(
                f'<tr><td style="padding:12px 0;border-bottom:1px solid #eef0f5;">'
                f'<div style="font:600 15px Arial,sans-serif;color:#0B1437;">{title}</div>'
                f'<a href="{escape(url)}" '
                f'style="display:inline-block;margin-top:8px;background:#2E1AC8;color:#ffffff;'
                f'text-decoration:none;font:700 13px Arial,sans-serif;padding:10px 18px;border-radius:8px;">'
                f'Download {title}</a></td></tr>'
            )
        else:
            rows.append(
                f'<tr><td style="padding:12px 0;border-bottom:1px solid #eef0f5;">'
                f'<div style="font:600 15px Arial,sans-serif;color:#0B1437;">{title}</div>'
                f'<div style="margin-top:6px;font:400 13px Arial,sans-serif;color:#6b7280;">'
                f'Your access link is being prepared and will arrive in a follow-up email shortly.</div>'
                f'</td></tr>'
            )
    items_html = "".join(rows)
    amount_html = ""
    if _fmt_inr(amount):
        amount_html = (
            f'<p style="font:400 14px Arial,sans-serif;color:#6b7280;margin:4px 0 0;">'
            f'Amount paid: <strong style="color:#0B1437;">{_fmt_inr(amount)}</strong></p>'
        )
    support_html = ""
    if support_email:
        support_html = (
            f'<p style="font:400 13px Arial,sans-serif;color:#6b7280;margin:20px 0 0;">'
            f'Need help? Just reply to this email or write to '
            f'<a href="mailto:{escape(support_email)}" style="color:#2E1AC8;">{escape(support_email)}</a>.</p>'
        )

    html = (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        f'style="background:#f6f7fb;padding:24px 0;"><tr><td align="center">'
        f'<table role="presentation" width="560" cellpadding="0" cellspacing="0" '
        f'style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;'
        f'border:1px solid #eef0f5;">'
        f'<tr><td style="background:#0B1437;padding:20px 28px;">'
        f'<span style="font:800 18px Arial,sans-serif;color:#ffffff;">{escape(EMAIL_FROM_NAME)}</span>'
        f'<span style="font:700 10px Arial,sans-serif;color:#FFD400;letter-spacing:2px;">  • PAYMENT CONFIRMED</span>'
        f'</td></tr>'
        f'<tr><td style="padding:28px;">'
        f'<h1 style="font:800 22px Arial,sans-serif;color:#0B1437;margin:0 0 8px;">Thank you for your purchase!</h1>'
        f'<p style="font:400 14px Arial,sans-serif;color:#374151;margin:0;">'
        f'Your payment was successful and your digital product is ready below.</p>'
        f'<p style="font:400 13px Arial,sans-serif;color:#6b7280;margin:14px 0 0;">'
        f'Order reference: <strong style="color:#0B1437;">{escape(order_id)}</strong></p>'
        f'{amount_html}'
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        f'style="margin-top:20px;">{items_html}</table>'
        f'{support_html}'
        f'<p style="font:400 12px Arial,sans-serif;color:#9aa1ad;margin:24px 0 0;">'
        f'Sent by {escape(EMAIL_FROM_NAME)}. For your security, we will never ask for your '
        f'password or card details by email.</p>'
        f'</td></tr></table></td></tr></table>'
    )
    return subject, html

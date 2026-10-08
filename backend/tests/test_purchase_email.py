"""Backend tests: purchase-to-email flow (Razorpay simulated verify + Emergent email)."""
import os
import hmac
import hashlib
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
BASE_URL = BASE_URL.rstrip("/")

# Load Razorpay secret from backend .env
_envtxt = open("/app/backend/.env").read()
def _env(key):
    for line in _envtxt.splitlines():
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None

RAZORPAY_KEY_ID = _env("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = _env("RAZORPAY_KEY_SECRET")

BUYER_EMAIL = "delivered@resend.dev"


def _sign(order_id, payment_id):
    msg = f"{order_id}|{payment_id}".encode()
    return hmac.new(RAZORPAY_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def _create(s, product_slug):
    r = s.post(f"{BASE_URL}/api/checkout/create-order",
               json={"items": [{"product_slug": product_slug}], "email": BUYER_EMAIL},
               timeout=30)
    assert r.status_code == 200, f"create-order failed {r.status_code}: {r.text}"
    data = r.json()
    assert "razorpay_order_id" in data and data["razorpay_order_id"]
    assert data.get("key_id") == RAZORPAY_KEY_ID
    assert "order_id" in data
    return data


def _verify(s, order_data, bad_sig=False):
    rzp_order = order_data["razorpay_order_id"]
    fake_payment = "pay_TEST" + uuid.uuid4().hex[:14]
    sig = _sign(rzp_order, fake_payment) if not bad_sig else "0" * 64
    r = s.post(f"{BASE_URL}/api/checkout/verify", json={
        "order_id": order_data["order_id"],
        "razorpay_order_id": rzp_order,
        "razorpay_payment_id": fake_payment,
        "razorpay_signature": sig,
    }, timeout=60)
    return r


def test_single_product_purchase_email_flow(s):
    od = _create(s, "ai-business-ideas-2026")
    r = _verify(s, od)
    assert r.status_code == 200, f"verify {r.status_code}: {r.text}"
    body = r.json()
    assert body.get("ok") is True
    assert body.get("status") == "paid"
    assert body.get("delivered") is True

    # fetch order
    time.sleep(1)
    g = s.get(f"{BASE_URL}/api/orders/{od['order_id']}", timeout=15)
    assert g.status_code == 200, g.text
    o = g.json()
    assert o.get("status") == "paid"
    assert o.get("delivery_status") == "sent"
    assert o.get("delivered_to") == BUYER_EMAIL
    downloads = o.get("downloads") or []
    assert len(downloads) >= 1, f"empty downloads: {o}"
    url = downloads[0].get("download_url")
    assert url, f"no download_url: {downloads[0]}"
    h = requests.get(url, timeout=30, stream=True)
    assert h.status_code == 200, f"download HTTP {h.status_code} for {url}"


def test_combo_6_pdf_delivers_six_downloads(s):
    od = _create(s, "medical-6-pdf-combo")
    r = _verify(s, od)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True and body.get("delivered") is True
    time.sleep(1)
    g = s.get(f"{BASE_URL}/api/orders/{od['order_id']}", timeout=15)
    assert g.status_code == 200
    o = g.json()
    assert o.get("status") == "paid"
    assert o.get("delivery_status") == "sent"
    downloads = o.get("downloads") or []
    assert len(downloads) == 6, f"expected 6 downloads, got {len(downloads)}: {[d.get('title') or d.get('filename') for d in downloads]}"


def test_wrong_signature_rejected(s):
    od = _create(s, "ai-business-ideas-2026")
    r = _verify(s, od, bad_sig=True)
    assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
    time.sleep(0.5)
    g = s.get(f"{BASE_URL}/api/orders/{od['order_id']}", timeout=15)
    assert g.status_code == 200
    o = g.json()
    assert o.get("status") == "payment_failed", f"status={o.get('status')}"
    assert o.get("delivery_status") != "sent"

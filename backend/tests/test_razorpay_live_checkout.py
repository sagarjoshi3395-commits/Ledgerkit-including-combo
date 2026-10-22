# Razorpay LIVE create-order regression (orders are created but never paid)
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
URL = f"{BASE_URL}/api/checkout/create-order"
BBS = "business-bookkeeping-system"
ADDON = "productivity-execution-bundle"


def _post(items, email="test@example.com"):
    return requests.post(URL, json={"items": items, "email": email}, timeout=30)


# Bookkeeping sheet + add-on -> live order
def test_bbs_with_addon_live_order():
    r = _post([{"product_slug": BBS, "edition": "digital"}, {"product_slug": ADDON, "edition": "digital"}])
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["razorpay_order_id"].startswith("order_")
    assert d["amount"] == 43900
    assert d["currency"] == "INR"
    assert d["key_id"].startswith("rzp_live_")
    assert "secret" not in str(d).lower()
    assert len(d["items"]) == 2


# Medical 6-PDF combo -> live order
def test_medical_combo_live_order():
    r = _post([{"product_slug": "medical-6-pdf-combo", "edition": "digital"}])
    assert r.status_code == 200, r.text
    d = r.json()
    # Seeded sale price is ₹297 (review request said 19900 — seed/UI say 297)
    assert d["amount"] == 29700
    assert d["key_id"].startswith("rzp_live_")


# Add-on alone is rejected (no Razorpay call made)
def test_addon_alone_rejected():
    r = _post([{"product_slug": ADDON, "edition": "digital"}])
    assert r.status_code == 400
    assert "only available with" in r.json()["detail"]


# Duplicate lines deduped
def test_duplicate_sheet_deduped():
    r = _post([{"product_slug": BBS, "edition": "digital"}, {"product_slug": BBS, "edition": "digital"}])
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["amount"] == 29000
    assert len(d["items"]) == 1

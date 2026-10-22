import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
SLUG = "productivity-execution-bundle"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# Bookkeeping-only add-on listing
def test_bookkeeping_addons(s):
    r = s.get(f"{BASE_URL}/api/bookkeeping/add-ons")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 1
    assert data[0]["slug"] == SLUG
    assert data[0]["editions"]["digital"]["price"] == 149
    assert "_id" not in data[0]


# Add-on hidden from generic listings
def test_generic_addons_exclude(s):
    r = s.get(f"{BASE_URL}/api/add-ons")
    assert r.status_code == 200
    assert SLUG not in [d["slug"] for d in r.json()]


def test_products_exclude(s):
    r = s.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    assert SLUG not in [d["slug"] for d in r.json()]


def test_product_detail_404(s):
    r = s.get(f"{BASE_URL}/api/products/{SLUG}")
    assert r.status_code == 404


def test_main_product_exists(s):
    r = s.get(f"{BASE_URL}/api/products/business-bookkeeping-system")
    assert r.status_code == 200
    d = r.json()
    price = (d.get("editions") or {}).get("digital", {}).get("price") or d.get("sale_price")
    assert price == 290


# Checkout without Razorpay keys -> 503
def test_create_order_503(s):
    r = s.post(f"{BASE_URL}/api/checkout/create-order", json={
        "items": [{"product_slug": "business-bookkeeping-system", "edition": "digital"},
                  {"product_slug": SLUG, "edition": "digital"}],
        "email": "test_user@example.com",
    })
    assert r.status_code == 503
    assert "temporarily unavailable" in r.json().get("detail", "")


def test_regression_combo6(s):
    r = s.get(f"{BASE_URL}/api/combo-6/add-ons")
    assert r.status_code == 200
    assert SLUG not in [d["slug"] for d in r.json()]

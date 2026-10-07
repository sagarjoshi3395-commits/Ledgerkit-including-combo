"""Backend tests for Medical 6-PDF Combo product + add-ons + checkout."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://ledger-website.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Combo product ---
def test_combo_product_endpoint(client):
    r = client.get(f"{BASE_URL}/api/products/medical-6-pdf-combo", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    # Price ₹297
    price = data.get("editions", {}).get("digital", {}).get("price")
    assert price == 297, f"Expected 297, got {price}"
    # 6 download files
    files = data.get("download_files") or data.get("editions", {}).get("digital", {}).get("download_files") or []
    assert len(files) == 6, f"Expected 6 download files, got {len(files)}: {files}"


# --- Combo-only add-ons ---
def test_combo6_addons(client):
    r = client.get(f"{BASE_URL}/api/combo-6/add-ons", timeout=15)
    assert r.status_code == 200
    data = r.json()
    slugs = sorted([p.get("slug") for p in data])
    assert slugs == ["ct-mri-xray-guide", "radiology-guide"], f"Got slugs: {slugs}"
    for p in data:
        assert p["editions"]["digital"]["price"] == 149


# --- Regular add-ons must exclude combo6-only ---
def test_regular_addons_excludes_combo6(client):
    r = client.get(f"{BASE_URL}/api/add-ons", timeout=15)
    assert r.status_code == 200
    data = r.json()
    slugs = [p.get("slug") for p in data]
    assert "ct-mri-xray-guide" not in slugs, f"Regression: combo6-only slug leaked: {slugs}"
    assert "radiology-guide" not in slugs, f"Regression: combo6-only slug leaked: {slugs}"


# --- Store list contains combo ---
def test_products_list_contains_combo(client):
    r = client.get(f"{BASE_URL}/api/products", timeout=15)
    assert r.status_code == 200
    data = r.json()
    slugs = [p.get("slug") for p in data]
    assert "medical-6-pdf-combo" in slugs, f"Combo missing from store list: {slugs}"
    assert len(data) >= 7, f"Expected >=7 products, got {len(data)}"


# --- Checkout: payments not configured ---
def test_checkout_payments_not_configured(client):
    payload = {
        "items": [
            {"product_slug": "medical-6-pdf-combo", "edition": "digital", "quantity": 1},
            {"product_slug": "ct-mri-xray-guide", "edition": "digital", "quantity": 1},
        ],
        "customer_email": "test@example.com",
        "customer_name": "Test",
    }
    r = client.post(f"{BASE_URL}/api/checkout/create-order", json=payload, timeout=15)
    assert r.status_code == 503, f"Expected 503, got {r.status_code}: {r.text}"
    detail = (r.json().get("detail") or "").lower()
    assert "payments are not configured" in detail, r.text

# Email delivery regression tests: Resend send, delivery template content,
# background delivery DB update, /checkout/verify (mocked signature), public product/settings APIs.
import os
import sys
import asyncio
import uuid
from pathlib import Path
from unittest.mock import MagicMock

import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import email_service  # noqa: E402
from email_service import build_delivery_email, send_email  # noqa: E402

OWNER_EMAIL = "s02329739@gmail.com"  # Resend account owner (sandbox only accepts this)
BK_PDF = "https://customer-assets-0z36b82j.emergentagent.net/job_ledgerkit-live/artifacts/11ee96d691e8475d_Bookkeeping_Business_Template_Access_Guide.pdf"
RAD_PDF = "https://customer-assets-0z36b82j.emergentagent.net/job_ledgerkit-live/artifacts/9b680d6bc60c56bf_physiotherapy-clinical-casebook-2026-.pdf"
CT_PDF = "https://customer-assets-0z36b82j.emergentagent.net/job_ledgerkit-live/artifacts/2c802fc0b177fac1_CT-MRI-XRay-Interpretation-Guide.pdf"
SHEET1 = "docs.google.com/spreadsheets/d/1_ejFeNTJVK7DBOh7cErqHbCw56TC-0_D"
SHEET2 = "docs.google.com/spreadsheets/d/1fGpv8aSp3RTQe_LVU9BaLuVQy9pTgp5IJccPWkiWhBY"
DRIVE = "drive.google.com/drive/folders/18E3cDIzHwJZ41MLJbudSFm5n1FWH42it"


# ---- Public API checks ----
class TestPublicApis:
    def test_bookkeeping_pdf_url(self):
        r = requests.get(f"{BASE_URL}/api/products/business-bookkeeping-system", timeout=20)
        assert r.status_code == 200
        assert r.json()["download_files"][0]["url"] == BK_PDF

    def test_combo6_addons_pdfs(self):
        r = requests.get(f"{BASE_URL}/api/combo-6/add-ons", timeout=20)
        assert r.status_code == 200
        data = r.json()
        items = data if isinstance(data, list) else data.get("add_ons") or data.get("items")
        by_slug = {x["slug"]: x for x in items}
        assert by_slug["radiology-guide"]["download_files"][0]["url"] == RAD_PDF
        assert by_slug["ct-mri-xray-guide"]["download_files"][0]["url"] == CT_PDF

    def test_settings(self):
        r = requests.get(f"{BASE_URL}/api/settings", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["support_email"] == "medicalmasterbook@gmail.com"
        assert d["support_hours"] == "10am to 7pm"


# ---- Template content ----
class TestDeliveryTemplate:
    def _build(self, slugs):
        return build_delivery_email(
            order_id="TEST_ORDER", amount=499,
            items=[{"title": "Business Bookkeeping Template Access Guide", "download_url": BK_PDF}],
            support_email="medicalmasterbook@gmail.com", product_slugs=slugs,
        )

    def test_bookkeeping_block_present(self):
        subject, html = self._build(["business-bookkeeping-system"])
        assert subject
        for needle in [BK_PDF, SHEET1, SHEET2, DRIVE, "Business Bookkeeping Spreadsheet",
                       "Habit Tracker", "500+ Excel Templates", "Make a copy", "<strong>File</strong>",
                       "10am to 7pm", "medicalmasterbook@gmail.com"]:
            assert needle in html, needle
        email_service._assert_safe_email(subject, html)  # passes guardrails

    def test_bookkeeping_block_absent_for_other_products(self):
        _, html = build_delivery_email(order_id="TEST_O2", amount=199,
                                       items=[{"title": "Meta Ads", "download_url": "https://example.com/a.pdf"}],
                                       support_email="medicalmasterbook@gmail.com",
                                       product_slugs=["meta-ads-decode"])
        for needle in [SHEET1, SHEET2, DRIVE, "Make a copy", "Habit Tracker"]:
            assert needle not in html
        _, html2 = build_delivery_email(order_id="TEST_O3", amount=1, items=[], support_email=None, product_slugs=None)
        assert SHEET1 not in html2


# ---- Live Resend + in-process background delivery / verify endpoint ----
def test_live_flow_inprocess():
    assert email_service.RESEND_API_KEY.startswith("re_")
    import server  # noqa: E402
    from httpx import AsyncClient, ASGITransport

    async def run():
        results = {}
        # 1) direct send
        subject, html = build_delivery_email(order_id="TEST_DIRECT", amount=499,
                                             items=[{"title": "Guide", "download_url": BK_PDF}],
                                             support_email="medicalmasterbook@gmail.com",
                                             product_slugs=["business-bookkeeping-system"])
        results["send_id"] = await send_email(to=OWNER_EMAIL, subject=subject, html=html)

        # 2) background delivery with seeded paid order
        oid = f"TEST_{uuid.uuid4().hex[:10]}"
        order = {"order_id": oid, "product_slug": "business-bookkeeping-system", "status": "paid",
                 "amount": 499, "currency": "INR", "email": OWNER_EMAIL,
                 "items": [{"product_slug": "business-bookkeeping-system", "product_title": "BK", "edition": "digital", "price": 499}]}
        await server.db.orders.insert_one(dict(order))
        await server._deliver_in_background(order, OWNER_EMAIL)
        results["bg"] = await server.db.orders.find_one({"order_id": oid}, {"_id": 0})

        # 3) /checkout/verify with mocked razorpay client
        oid2 = f"TEST_{uuid.uuid4().hex[:10]}"
        rzp_oid = f"order_TEST{uuid.uuid4().hex[:8]}"
        await server.db.orders.insert_one({**order, "order_id": oid2, "status": "created", "razorpay_order_id": rzp_oid})
        mock = MagicMock()
        mock.utility.verify_payment_signature.return_value = True
        mock.payment.fetch.return_value = {"email": OWNER_EMAIL}
        orig = server.razorpay_client
        server.razorpay_client = mock
        try:
            async with AsyncClient(transport=ASGITransport(app=server.app), base_url="http://t") as c:
                r = await c.post("/api/checkout/verify", json={"order_id": oid2, "razorpay_order_id": rzp_oid,
                                                                "razorpay_payment_id": "pay_TEST1", "razorpay_signature": "sig"})
                results["verify"] = (r.status_code, r.json())
            for _ in range(30):
                doc = await server.db.orders.find_one({"order_id": oid2}, {"_id": 0})
                if doc.get("delivery_status"):
                    break
                await asyncio.sleep(1)
            results["verify_doc"] = doc
        finally:
            server.razorpay_client = orig
            await server.db.orders.delete_many({"order_id": {"$in": [oid, oid2]}})
        return results

    res = asyncio.run(run())
    print(res["send_id"], res["bg"].get("delivery_status"), res["verify"], res["verify_doc"].get("delivery_status"))
    assert isinstance(res["send_id"], str) and res["send_id"]
    assert res["bg"]["delivery_status"] == "sent" and res["bg"]["delivered_to"] == OWNER_EMAIL
    assert res["verify"][0] == 200 and res["verify"][1]["status"] == "paid" and res["verify"][1]["delivery"] == "queued"
    assert res["verify_doc"]["status"] == "paid"
    assert res["verify_doc"]["delivery_status"] == "sent" and res["verify_doc"]["delivered_to"] == OWNER_EMAIL

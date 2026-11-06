# Resend 403 "domain not verified" fallback tests (email_service.send_email + _deliver_in_background)
# and static checks of the dual bookkeeping Meta Pixel wiring (metaPixel.js / BookkeepingLanding / OrderSuccess).
import asyncio
import json
import os
import re
import subprocess
import sys
import uuid
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import email_service  # noqa: E402
from email_service import build_delivery_email, send_email  # noqa: E402

OWNER = "s02329739@gmail.com"
BUYER = "medicalmasterbook@gmail.com"
FE = Path("/app/frontend/src")
FORBIDDEN_403 = '{"statusCode":403,"message":"The ledgerkit.in domain is not verified. Please, add and verify your domain on https://resend.com/domains","name":"validation_error"}'


def _email():
    return build_delivery_email(order_id="TEST_FB", amount=499,
                                items=[{"title": "Guide", "download_url": "https://example.com/a.pdf"}],
                                support_email="medicalmasterbook@gmail.com",
                                product_slugs=["business-bookkeeping-system"])


def _install_fake(monkeypatch, responses):
    """Patch httpx.AsyncClient.post; responses = list of (status, body)."""
    calls = []

    async def fake_post(self, url, headers=None, json=None, **kw):
        calls.append({"url": url, "json": json})
        status, body = responses[min(len(calls) - 1, len(responses) - 1)]
        return httpx.Response(status, text=body, request=httpx.Request("POST", url))

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    return calls


# ---- Mocked: buyer address -> 403 -> fallback to owner ----
class TestFallbackMocked:
    def test_403_triggers_owner_fallback(self, monkeypatch):
        calls = _install_fake(monkeypatch, [(403, FORBIDDEN_403), (200, '{"id":"stub-id-1"}')])
        subject, html = _email()
        rid = asyncio.run(send_email(to=BUYER, subject=subject, html=html))
        assert rid == "stub-id-1"
        assert len(calls) == 2
        assert calls[0]["json"]["to"] == [BUYER]
        fb = calls[1]["json"]
        assert fb["from"] == "LedgerKit <onboarding@resend.dev>"
        assert fb["to"] == [OWNER]
        assert fb["subject"].startswith("[PENDING DOMAIN]")
        assert f"original buyer: {BUYER}" in fb["subject"]
        assert BUYER in fb["html"] and "fff4d6" in fb["html"]
        assert fb["html"].endswith(html)

    def test_owner_send_no_fallback(self, monkeypatch):
        calls = _install_fake(monkeypatch, [(200, '{"id":"owner-id"}')])
        subject, html = _email()
        rid = asyncio.run(send_email(to=OWNER, subject=subject, html=html))
        assert rid == "owner-id" and len(calls) == 1
        assert calls[0]["json"]["to"] == [OWNER]
        assert not calls[0]["json"]["subject"].startswith("[PENDING DOMAIN]")

    def test_non_verif_403_no_fallback(self, monkeypatch):
        calls = _install_fake(monkeypatch, [(403, '{"message":"API key is invalid"}')])
        subject, html = _email()
        assert asyncio.run(send_email(to=BUYER, subject=subject, html=html)) is None
        assert len(calls) == 1

    def test_fallback_failure_returns_none(self, monkeypatch):
        calls = _install_fake(monkeypatch, [(403, FORBIDDEN_403), (500, '{"message":"boom"}')])
        subject, html = _email()
        assert asyncio.run(send_email(to=BUYER, subject=subject, html=html)) is None
        assert len(calls) == 2


# ---- Mocked: _deliver_in_background with non-owner buyer ----
def test_deliver_in_background_fallback(monkeypatch):
    import server  # noqa: E402
    calls = _install_fake(monkeypatch, [(403, FORBIDDEN_403), (200, '{"id":"stub-id-1"}')])

    async def run():
        oid = f"TEST_{uuid.uuid4().hex[:10]}"
        order = {"order_id": oid, "product_slug": "business-bookkeeping-system", "status": "paid",
                 "amount": 499, "currency": "INR", "email": BUYER,
                 "items": [{"product_slug": "business-bookkeeping-system", "product_title": "BK",
                            "edition": "digital", "price": 499}]}
        await server.db.orders.insert_one(dict(order))
        try:
            await server._deliver_in_background(order, BUYER)
            return await server.db.orders.find_one({"order_id": oid}, {"_id": 0})
        finally:
            await server.db.orders.delete_one({"order_id": oid})

    doc = asyncio.run(run())
    assert len(calls) == 2 and calls[1]["json"]["to"] == [OWNER]
    assert doc["delivery_status"] == "sent"
    assert doc["delivered_to"] == BUYER


# ---- LIVE: exactly one real fallback send (403 rejection is not a send) ----
def test_live_buyer_send_falls_back(monkeypatch):
    assert email_service.RESEND_API_KEY.startswith("re_")
    orig = httpx.AsyncClient.post
    calls = []

    async def spy(self, url, *a, **kw):
        r = await orig(self, url, *a, **kw)
        calls.append({"json": kw.get("json"), "status": r.status_code, "text": r.text[:200]})
        return r

    monkeypatch.setattr(httpx.AsyncClient, "post", spy)
    subject, html = _email()
    rid = asyncio.run(send_email(to=BUYER, subject=subject, html=html))
    print("LIVE calls:", json.dumps([{k: v for k, v in c.items() if k != "json"} for c in calls]), "id:", rid)
    assert isinstance(rid, str) and rid
    if len(calls) == 2:  # domain still unverified -> fallback path used
        assert calls[0]["status"] == 403
        assert calls[1]["json"]["to"] == [OWNER]
        assert calls[1]["json"]["subject"].startswith("[PENDING DOMAIN]")


# ---- Frontend static: metaPixel.js behaviour (executed in node) ----
def _run_node(js):
    src = (FE / "lib/metaPixel.js").read_text()
    src = src.replace('import { useEffect } from "react";', "").replace("export function", "function")
    harness = ("const calls=[];const useEffect=(fn)=>fn();"
               "global.window={fbq:(...a)=>calls.push(a)};global.document={};\n" + src + "\n" + js)
    out = subprocess.run(["node", "-e", harness], capture_output=True, text=True, timeout=30)
    assert out.returncode == 0, out.stderr
    return json.loads(out.stdout.strip())


def test_pixel_ids_for_slug():
    res = _run_node("console.log(JSON.stringify(['business-bookkeeping-system','medical-6-pdf-combo',"
                    "'ct-mri-xray-guide','radiology-guide','unknown-x',null].map(pixelIdsForProductSlug)))")
    assert res[0] == ["1605079064338578", "2251324629120904"]
    assert res[1] == res[2] == res[3] == ["3470309736541129"]
    assert res[4] == [] and res[5] == []


def test_use_meta_pixel_string_and_array():
    res = _run_node("useMetaPixel(['A1','B2']);useMetaPixel('C3');useMetaPixel('A1');"
                    "console.log(JSON.stringify(calls.filter(c=>c[0]==='init').map(c=>c[1])))")
    assert res == ["A1", "B2", "C3"]


def test_pages_wiring():
    bk = (FE / "pages/BookkeepingLanding.jsx").read_text()
    assert re.search(r'useMetaPixel\(\[\s*"1605079064338578",\s*"2251324629120904"\s*\]\)', bk)
    os_ = (FE / "pages/OrderSuccess.jsx").read_text()
    assert "pixelIdsForProductSlug" in os_
    assert not re.search(r"\bpixelIdForProductSlug\b", os_)
    assert re.search(r"pixelIds\.forEach\(\(id\) => initMetaPixel\(id\)\)", os_)

from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import razorpay
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, Annotated, List
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator, EmailStr

from seed_data import META_ADS_DECODE_PRODUCT, CATEGORIES, SITE_SETTINGS, TESTIMONIALS, AI_IDEAS_PRODUCT, PROMPT_GUIDE_PRODUCT, BUNDLE_PRODUCT, MEDICAL_BUNDLE_PRODUCT
from email_service import send_email, build_delivery_email

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
razorpay_client = (
    razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    else None
)

app = FastAPI(title="Decode Storefront API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        doc = self.model_dump(by_alias=True, exclude_none=True)
        doc.pop("_id", None)
        return doc

    @classmethod
    def from_mongo(cls, doc):
        if not doc:
            return None
        return cls(**doc)


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    order_id: Optional[str] = None
    topic: str
    message: str


class ContactMessage(ContactIn, BaseDocument):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderCreate(BaseModel):
    product_slug: str
    edition: str = "digital"
    email: Optional[EmailStr] = None


class Order(BaseDocument):
    order_id: str = Field(default_factory=lambda: f"ORD-{uuid.uuid4().hex[:10].upper()}")
    product_slug: str
    product_title: str = ""
    edition: str = "digital"
    amount: Optional[float] = None
    currency: str = "INR"
    email: Optional[str] = None
    status: str = "payment_pending"
    payment_provider: str = "external"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CheckoutItem(BaseModel):
    product_slug: str
    edition: str = "digital"


class RazorpayCreateIn(BaseModel):
    items: List[CheckoutItem]
    email: Optional[EmailStr] = None


class RazorpayVerifyIn(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class ProductCreate(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str
    slug: str
    category: str = "guides"
    tagline: str = ""
    description: str = ""
    regular_price: Optional[float] = None
    sale_price: Optional[float] = None
    featured: bool = False
    is_new: bool = True
    checkout_url: str = ""


def serialize_doc(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"key": "site"})
    return serialize_doc(settings) if settings else SITE_SETTINGS


@api_router.get("/categories")
async def get_categories():
    cats = await db.categories.find({}).to_list(100)
    return [serialize_doc(c) for c in cats]


@api_router.get("/products")
async def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort: Optional[str] = "featured",
    featured: Optional[bool] = None,
):
    query: dict = {"status": "published", "is_add_on": {"$ne": True}}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"tagline": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    products = await db.products.find(query).to_list(200)

    def price_of(p):
        edition_price = (p.get("editions") or {}).get("digital", {}).get("price")
        return p.get("sale_price") or edition_price or p.get("regular_price") or 0

    if sort == "price_asc":
        products.sort(key=price_of)
    elif sort == "price_desc":
        products.sort(key=price_of, reverse=True)
    elif sort == "newest":
        products.sort(key=lambda p: str(p.get("created_at", "")), reverse=True)
    else:
        products.sort(key=lambda p: (not p.get("featured", False), str(p.get("created_at", ""))))
    return [serialize_doc(p) for p in products]


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug, "status": "published", "is_add_on": {"$ne": True}})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(product)


@api_router.get("/add-ons/combo")
async def get_add_ons_combo():
    """Special all-5 add-ons combo product (hidden from store listings)."""
    combo = await db.products.find_one({"slug": "addons-combo-pack", "status": "published", "is_combo": True})
    if not combo:
        raise HTTPException(status_code=404, detail="Combo not found")
    return serialize_doc(combo)


@api_router.get("/add-ons")
async def list_add_ons():
    """Add-on guides — purchasable at checkout, hidden from store listings.
    combo6_only add-ons are excluded: they are sold only on the 6-PDF combo page."""
    docs = await db.products.find({"status": "published", "is_add_on": True, "is_combo": {"$ne": True}, "combo6_only": {"$ne": True}}).sort("editions.digital.price", 1).to_list(50)
    return [serialize_doc(d) for d in docs]


@api_router.get("/combo-6/add-ons")
async def list_combo6_add_ons():
    """Add-ons sold only alongside the Ledgerkit 6 PDF Medical Combo."""
    docs = await db.products.find({"status": "published", "combo6_only": True}).sort("editions.digital.price", 1).to_list(10)
    return [serialize_doc(d) for d in docs]


@api_router.get("/testimonials")
async def list_testimonials(product_slug: Optional[str] = None):
    query = {"product_slug": product_slug} if product_slug else {}
    items = await db.testimonials.find(query).to_list(100)
    return [serialize_doc(t) for t in items]


@api_router.post("/contact")
async def create_contact(payload: ContactIn):
    msg = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(msg.to_mongo())
    return {"ok": True, "message": "Your message has been received. We will get back to you soon."}


@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    product = await db.products.find_one({"slug": payload.product_slug, "status": "published"})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    edition = (product.get("editions") or {}).get(payload.edition)
    if not edition:
        raise HTTPException(status_code=400, detail="Unknown edition")
    order = Order(
        product_slug=product["slug"],
        product_title=product["title"],
        edition=payload.edition,
        amount=edition.get("price"),
        currency=product.get("currency", "INR"),
        email=str(payload.email) if payload.email else None,
    )
    await db.orders.insert_one(order.to_mongo())
    checkout_url = edition.get("checkout_url") or product.get("checkout_url") or ""
    return {"order_id": order.order_id, "checkout_url": checkout_url, "amount": order.amount, "currency": order.currency}


@api_router.post("/checkout/create-order")
async def create_razorpay_order(payload: RazorpayCreateIn):
    """Create a Razorpay order for one or more items (guide / add-ons / combo / bundle).
    Amount is always computed server-side from DB prices — never trusted from the client."""
    if razorpay_client is None:
        raise HTTPException(status_code=503, detail="Payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.")
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items to check out")

    line_items = []
    total = 0.0
    currency = "INR"
    for item in payload.items:
        product = await db.products.find_one({"slug": item.product_slug, "status": "published"})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.product_slug}")
        edition = (product.get("editions") or {}).get(item.edition)
        if not edition:
            raise HTTPException(status_code=400, detail=f"Unknown edition '{item.edition}' for {item.product_slug}")
        price = edition.get("price")
        if price is None:
            raise HTTPException(status_code=400, detail=f"No price set for {item.product_slug}")
        currency = product.get("currency", "INR")
        total += float(price)
        line_items.append({
            "product_slug": product["slug"],
            "product_title": product["title"],
            "edition": item.edition,
            "price": float(price),
        })

    if total <= 0:
        raise HTTPException(status_code=400, detail="Order total must be greater than zero")

    amount_paise = int(round(total * 100))
    order = Order(
        product_slug=line_items[0]["product_slug"],
        product_title=" + ".join(li["product_title"] for li in line_items),
        edition=line_items[0]["edition"],
        amount=total,
        currency=currency,
        email=str(payload.email) if payload.email else None,
        payment_provider="razorpay",
    )
    order_doc = order.to_mongo()
    order_doc["items"] = line_items

    try:
        rzp_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": currency,
            "receipt": order.order_id,
            "payment_capture": 1,
            "notes": {"order_id": order.order_id},
        })
    except Exception as exc:
        logger.error("Razorpay order creation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not create payment order. Please try again.")

    order_doc["razorpay_order_id"] = rzp_order["id"]
    await db.orders.insert_one(order_doc)

    return {
        "order_id": order.order_id,
        "razorpay_order_id": rzp_order["id"],
        "amount": amount_paise,
        "display_amount": total,
        "currency": currency,
        "key_id": RAZORPAY_KEY_ID,
        "name": "LedgerKit",
        "description": order.product_title,
        "items": line_items,
    }


BUNDLE_PART_SLUGS = ["meta-ads-decode", "ai-business-ideas-2026", "chatgpt-prompt-guide"]


async def _resolve_downloads(order_doc: dict) -> list:
    """Expand a paid order's items into the actual downloadable guides.
    A bundle expands to its parts; duplicates are removed. Returns
    [{slug, title, download_url, cover_image}] in purchase order."""
    items = order_doc.get("items") or [{
        "product_slug": order_doc.get("product_slug"),
        "product_title": order_doc.get("product_title"),
        "edition": order_doc.get("edition", "digital"),
    }]
    slugs: list[str] = []
    for it in items:
        slug = it.get("product_slug")
        if slug == "complete-business-bundle":
            slugs.extend(BUNDLE_PART_SLUGS)
        elif slug:
            slugs.append(slug)
    seen = set()
    downloads = []
    for slug in slugs:
        if slug in seen:
            continue
        seen.add(slug)
        product = await db.products.find_one({"slug": slug})
        if not product:
            continue
        files = product.get("download_files")
        if files:
            # Product bundles multiple files (e.g. a 2-book bundle).
            for f in files:
                downloads.append({
                    "slug": f"{slug}:{(f.get('title') or '').lower().replace(' ', '-')}",
                    "title": f.get("title", product.get("title", "Your guide")),
                    "download_url": f.get("url", ""),
                    "cover_image": product.get("cover_image", ""),
                })
        else:
            downloads.append({
                "slug": slug,
                "title": product.get("title", "Your guide"),
                "download_url": product.get("download_url", ""),
                "cover_image": product.get("cover_image", ""),
            })
    return downloads


async def _deliver_products(order_doc: dict, buyer_email: str) -> bool:
    """Build and send the digital-product delivery email for a paid order.
    Recipient + content are entirely server-side (G4). Never raises."""
    downloads = await _resolve_downloads(order_doc)
    delivery_items = [{"title": d["title"], "download_url": d["download_url"]} for d in downloads]
    settings = await db.settings.find_one({"key": "site"}) or {}
    support_email = settings.get("support_email") or SITE_SETTINGS.get("support_email")
    subject, html = build_delivery_email(
        order_id=order_doc.get("order_id"),
        items=delivery_items,
        amount=order_doc.get("amount"),
        support_email=support_email,
    )
    email_id = await send_email(to=buyer_email, subject=subject, html=html)
    return bool(email_id)


@api_router.post("/checkout/verify")
async def verify_razorpay_payment(payload: RazorpayVerifyIn):
    """Verify the Razorpay payment signature, mark the order paid, and email delivery."""
    if razorpay_client is None:
        raise HTTPException(status_code=503, detail="Payments are not configured.")
    order = await db.orders.find_one({"order_id": payload.order_id, "razorpay_order_id": payload.razorpay_order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        await db.orders.update_one({"order_id": payload.order_id}, {"$set": {"status": "payment_failed"}})
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    # Resolve the buyer's email authoritatively from the Razorpay payment record.
    buyer_email = order.get("email")
    try:
        payment = razorpay_client.payment.fetch(payload.razorpay_payment_id)
        buyer_email = payment.get("email") or buyer_email
    except Exception as exc:
        logger.warning("Could not fetch Razorpay payment %s: %s", payload.razorpay_payment_id, exc)

    await db.orders.update_one(
        {"order_id": payload.order_id},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": payload.razorpay_payment_id,
            "email": buyer_email,
            "paid_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    # Deliver the product by email (never blocks the payment result).
    delivered = False
    if buyer_email:
        order["items"] = order.get("items")
        delivered = await _deliver_products(order, buyer_email)
        await db.orders.update_one(
            {"order_id": payload.order_id},
            {"$set": {"delivery_status": "sent" if delivered else "pending", "delivered_to": buyer_email if delivered else None}},
        )

    return {"ok": True, "order_id": payload.order_id, "status": "paid", "delivered": delivered}


@api_router.get("/orders/recent-summary")
async def recent_orders_summary():
    """Genuine paid-order count only. Powers the recent-purchase notice; hidden when zero."""
    since = datetime.now(timezone.utc) - timedelta(days=7)
    count = await db.orders.count_documents({"status": "paid", "created_at": {"$gte": since}})
    return {"paid_orders_last_7_days": count}


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    downloads = []
    if order.get("status") in ("paid", "delivered"):
        downloads = await _resolve_downloads(order)
    order = serialize_doc(order)
    order.pop("email", None)
    order["downloads"] = downloads
    return order


@api_router.post("/admin/products")
async def admin_create_product(payload: ProductCreate, x_admin_key: Optional[str] = Header(default=None)):
    admin_key = os.environ.get("ADMIN_KEY")
    if not admin_key:
        raise HTTPException(status_code=503, detail="Admin API disabled. Set ADMIN_KEY in backend/.env to enable.")
    if x_admin_key != admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    existing = await db.products.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=409, detail="A product with this slug already exists")
    data = payload.model_dump()
    checkout_url = data.pop("checkout_url", "")
    data.setdefault("short_title", data["title"])
    data.setdefault("product_type", "Guide")
    data.setdefault("currency", "INR")
    data.setdefault("bestseller", False)
    data.setdefault("offer_end", None)
    data.setdefault("whats_included", [])
    data.setdefault("key_benefits", [])
    data.setdefault("bonuses", [])
    data.setdefault("faqs", [])
    data.setdefault("sample_pages", [])
    data["editions"] = {
        "digital": {
            "label": "Digital Edition",
            "badge": "Instant Access",
            "price": data.get("sale_price") or data.get("regular_price"),
            "cta": "Get Instant Access",
            "note": "Digital Product • No Physical Delivery",
            "checkout_url": checkout_url,
            "features": [],
        },
    }
    data["status"] = "published"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(data)
    return {"ok": True, "slug": payload.slug}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("startup")
async def seed_database():
    await db.products.create_index("slug", unique=True)
    from seed_data import ADD_ON_PRODUCTS, BOOKKEEPING_PRODUCT, COMBO_PRODUCT, MEDICAL_6_COMBO_PRODUCT, COMBO6_ADD_ON_PRODUCTS
    for product_doc in [META_ADS_DECODE_PRODUCT, AI_IDEAS_PRODUCT, PROMPT_GUIDE_PRODUCT, BUNDLE_PRODUCT, MEDICAL_BUNDLE_PRODUCT, BOOKKEEPING_PRODUCT, MEDICAL_6_COMBO_PRODUCT, *ADD_ON_PRODUCTS, *COMBO6_ADD_ON_PRODUCTS, COMBO_PRODUCT]:
        doc = dict(product_doc)
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)
    for cat in CATEGORIES:
        await db.categories.update_one({"slug": cat["slug"]}, {"$set": dict(cat)}, upsert=True)
    await db.settings.update_one({"key": "site"}, {"$set": SITE_SETTINGS}, upsert=True)
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([dict(t) for t in TESTIMONIALS])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

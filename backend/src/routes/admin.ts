import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import { Category, Tenant } from "../types";
import { newId, slugify } from "../utils";
import { getProductWithRelations, listProducts, replaceProductRelations } from "../products";

export const adminRouter = Router();
adminRouter.use(requireAuth);

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(UPLOADS_DIR, req.auth!.tenantId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${newId("img")}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.mimetype)) {
      return cb(new Error("Formato de imagen no soportado"));
    }
    cb(null, true);
  },
});

adminRouter.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ninguna imagen" });
  res.json({ url: `/uploads/${req.auth!.tenantId}/${req.file.filename}` });
});

// ---- Store settings ----

const FONT_KEYS = ["sora-jakarta", "playfair-inter", "poppins", "spacegrotesk-work", "dmserif-dmsans"];

adminRouter.get("/store", (req, res) => {
  const tenant = db
    .prepare("SELECT * FROM tenants WHERE id = ?")
    .get(req.auth!.tenantId) as unknown as Tenant;
  res.json({
    name: tenant.name,
    whatsappNumber: tenant.whatsapp_number,
    accentColor: tenant.accent_color,
    tagline: tenant.tagline,
    fontKey: tenant.font_key,
    logoUrl: tenant.logo_url,
    featuredProductId: tenant.featured_product_id,
    heroSubtitle: tenant.hero_subtitle,
    heroCtaLabel: tenant.hero_cta_label,
    purchaseNote: tenant.purchase_note,
    contactEmail: tenant.contact_email,
    contactAddress: tenant.contact_address,
  });
});

adminRouter.put("/store", (req, res) => {
  const body = req.body as {
    name?: string;
    whatsappNumber?: string;
    accentColor?: string;
    tagline?: string;
    fontKey?: string;
    logoUrl?: string | null;
    featuredProductId?: string | null;
    heroSubtitle?: string;
    heroCtaLabel?: string;
    purchaseNote?: string;
    contactEmail?: string | null;
    contactAddress?: string | null;
  };

  const current = db
    .prepare("SELECT * FROM tenants WHERE id = ?")
    .get(req.auth!.tenantId) as unknown as Tenant;

  if (body.fontKey && !FONT_KEYS.includes(body.fontKey)) {
    return res.status(400).json({ error: "Tipografía no válida" });
  }

  if (Object.prototype.hasOwnProperty.call(body, "featuredProductId") && body.featuredProductId) {
    const product = db
      .prepare("SELECT id FROM products WHERE id = ? AND tenant_id = ?")
      .get(body.featuredProductId, req.auth!.tenantId);
    if (!product) return res.status(400).json({ error: "Producto destacado no válido" });
  }

  const pick = <T>(key: string, fallback: T): T =>
    Object.prototype.hasOwnProperty.call(body, key) ? ((body as never)[key] as T) : fallback;

  const logoUrl = pick("logoUrl", current.logo_url);
  const featuredProductId = pick("featuredProductId", current.featured_product_id);
  const contactEmail = pick("contactEmail", current.contact_email);
  const contactAddress = pick("contactAddress", current.contact_address);

  db.prepare(
    `UPDATE tenants
     SET name = ?, whatsapp_number = ?, accent_color = ?, tagline = ?, font_key = ?, logo_url = ?,
         featured_product_id = ?, hero_subtitle = ?, hero_cta_label = ?, purchase_note = ?,
         contact_email = ?, contact_address = ?
     WHERE id = ?`
  ).run(
    body.name ?? current.name,
    body.whatsappNumber ?? current.whatsapp_number,
    body.accentColor ?? current.accent_color,
    body.tagline ?? current.tagline,
    body.fontKey ?? current.font_key,
    logoUrl,
    featuredProductId,
    body.heroSubtitle ?? current.hero_subtitle,
    body.heroCtaLabel ?? current.hero_cta_label,
    body.purchaseNote ?? current.purchase_note,
    contactEmail,
    contactAddress,
    req.auth!.tenantId
  );

  res.json({ ok: true });
});

// ---- Stats / overview ----

adminRouter.get("/stats", (req, res) => {
  const tenantId = req.auth!.tenantId;

  const tenant = db.prepare("SELECT views FROM tenants WHERE id = ?").get(tenantId) as unknown as {
    views: number;
  };

  const productCounts = db
    .prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'sold_out' THEN 1 ELSE 0 END) as soldOut
       FROM products WHERE tenant_id = ?`
    )
    .get(tenantId) as unknown as { total: number; active: number | null; soldOut: number | null };

  const categoryCount = db
    .prepare("SELECT COUNT(*) as total FROM categories WHERE tenant_id = ?")
    .get(tenantId) as unknown as { total: number };

  const topProducts = db
    .prepare(
      `SELECT p.id, p.name, p.price, p.views,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as thumbnail
       FROM products p
       WHERE p.tenant_id = ?
       ORDER BY p.views DESC, p.created_at DESC
       LIMIT 5`
    )
    .all(tenantId);

  res.json({
    storeViews: tenant.views,
    totalProducts: productCounts.total,
    activeProducts: productCounts.active ?? 0,
    soldOutProducts: productCounts.soldOut ?? 0,
    totalCategories: categoryCount.total,
    topProducts,
  });
});

// ---- Categories ----

adminRouter.get("/categories", (req, res) => {
  const categories = db
    .prepare("SELECT id, name, slug FROM categories WHERE tenant_id = ? ORDER BY name ASC")
    .all(req.auth!.tenantId);
  res.json(categories);
});

adminRouter.post("/categories", (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) return res.status(400).json({ error: "El nombre es obligatorio" });

  const id = newId("cat");
  const slug = slugify(name);
  db.prepare("INSERT INTO categories (id, tenant_id, name, slug) VALUES (?, ?, ?, ?)").run(
    id,
    req.auth!.tenantId,
    name.trim(),
    slug
  );
  res.status(201).json({ id, name: name.trim(), slug });
});

adminRouter.delete("/categories/:id", (req, res) => {
  const category = db
    .prepare("SELECT * FROM categories WHERE id = ? AND tenant_id = ?")
    .get(req.params.id, req.auth!.tenantId) as unknown as Category | undefined;
  if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

  db.prepare("DELETE FROM categories WHERE id = ?").run(category.id);
  res.json({ ok: true });
});

// ---- Products ----

adminRouter.get("/products", (req, res) => {
  const products = listProducts(req.auth!.tenantId, {});
  res.json(products);
});

adminRouter.get("/products/:id", (req, res) => {
  const product = getProductWithRelations(req.params.id, req.auth!.tenantId);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

interface ProductBody {
  name: string;
  price: number;
  description: string;
  categoryId: string | null;
  status: "active" | "sold_out";
  images: string[];
  features: { label: string; value: string }[];
  variants: string[];
}

function validateProductBody(body: Partial<ProductBody>): string | null {
  if (!body.name || !body.name.trim()) return "El nombre del producto es obligatorio";
  if (typeof body.price !== "number" || body.price < 0) return "El precio debe ser un número válido";
  return null;
}

adminRouter.post("/products", (req, res) => {
  const body = req.body as Partial<ProductBody>;
  const error = validateProductBody(body);
  if (error) return res.status(400).json({ error });

  const id = newId("prod");
  db.prepare(
    `INSERT INTO products (id, tenant_id, category_id, name, price, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.auth!.tenantId,
    body.categoryId ?? null,
    body.name!.trim(),
    body.price as number,
    body.description ?? "",
    body.status ?? "active"
  );

  replaceProductRelations(id, body.images ?? [], body.features ?? [], body.variants ?? []);

  res.status(201).json(getProductWithRelations(id, req.auth!.tenantId));
});

adminRouter.put("/products/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM products WHERE id = ? AND tenant_id = ?")
    .get(req.params.id, req.auth!.tenantId);
  if (!existing) return res.status(404).json({ error: "Producto no encontrado" });

  const body = req.body as Partial<ProductBody>;
  const error = validateProductBody(body);
  if (error) return res.status(400).json({ error });

  db.prepare(
    `UPDATE products SET category_id = ?, name = ?, price = ?, description = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    body.categoryId ?? null,
    body.name!.trim(),
    body.price as number,
    body.description ?? "",
    body.status ?? "active",
    req.params.id
  );

  replaceProductRelations(req.params.id, body.images ?? [], body.features ?? [], body.variants ?? []);

  res.json(getProductWithRelations(req.params.id, req.auth!.tenantId));
});

adminRouter.delete("/products/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM products WHERE id = ? AND tenant_id = ?")
    .get(req.params.id, req.auth!.tenantId);
  if (!existing) return res.status(404).json({ error: "Producto no encontrado" });

  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

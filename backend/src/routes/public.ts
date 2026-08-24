import { Router } from "express";
import { db } from "../db";
import { resolveTenant } from "../middleware/tenant";
import { Category } from "../types";
import { getProductWithRelations, listProducts } from "../products";

export const publicRouter = Router();

publicRouter.get("/store/:tenantSlug", resolveTenant, (req, res) => {
  const t = req.tenant!;

  db.prepare("UPDATE tenants SET views = views + 1 WHERE id = ?").run(t.id);

  res.json({
    slug: t.slug,
    name: t.name,
    whatsappNumber: t.whatsapp_number,
    accentColor: t.accent_color,
    tagline: t.tagline,
    fontKey: t.font_key,
    logoUrl: t.logo_url,
    featuredProductId: t.featured_product_id,
    heroSubtitle: t.hero_subtitle,
    heroCtaLabel: t.hero_cta_label,
    purchaseNote: t.purchase_note,
    contactEmail: t.contact_email,
    contactAddress: t.contact_address,
  });
});

publicRouter.get("/store/:tenantSlug/categories", resolveTenant, (req, res) => {
  const categories = db
    .prepare("SELECT id, name, slug FROM categories WHERE tenant_id = ? ORDER BY name ASC")
    .all(req.tenant!.id) as unknown as Pick<Category, "id" | "name" | "slug">[];
  res.json(categories);
});

publicRouter.get("/store/:tenantSlug/products", resolveTenant, (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const products = listProducts(req.tenant!.id, {
    categorySlug: category,
    q,
    onlyActive: true,
  });

  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      status: p.status,
      categoryName: p.categoryName,
      thumbnail: p.thumbnail,
    }))
  );
});

publicRouter.get("/store/:tenantSlug/products/:productId", resolveTenant, (req, res) => {
  const product = getProductWithRelations(req.params.productId, req.tenant!.id);
  if (!product || product.status !== "active") {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  db.prepare("UPDATE products SET views = views + 1 WHERE id = ?").run(product.id);

  res.json(product);
});

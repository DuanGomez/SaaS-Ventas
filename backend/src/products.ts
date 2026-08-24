import { db } from "./db";
import { Product, ProductImage, ProductFeature, ProductVariant } from "./types";
import { newId } from "./utils";

export interface ProductDTO extends Product {
  categoryName: string | null;
  images: string[];
  features: { label: string; value: string }[];
  variants: string[];
}

export function getProductWithRelations(productId: string, tenantId: string): ProductDTO | null {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ? AND tenant_id = ?")
    .get(productId, tenantId) as unknown as Product | undefined;

  if (!product) return null;

  const category = product.category_id
    ? (db.prepare("SELECT name FROM categories WHERE id = ?").get(product.category_id) as
        | { name: string }
        | undefined)
    : undefined;

  const images = db
    .prepare("SELECT url FROM product_images WHERE product_id = ? ORDER BY position ASC")
    .all(productId) as unknown as Pick<ProductImage, "url">[];

  const features = db
    .prepare("SELECT label, value FROM product_features WHERE product_id = ? ORDER BY position ASC")
    .all(productId) as unknown as Pick<ProductFeature, "label" | "value">[];

  const variants = db
    .prepare("SELECT label FROM product_variants WHERE product_id = ? ORDER BY position ASC")
    .all(productId) as unknown as Pick<ProductVariant, "label">[];

  return {
    ...product,
    categoryName: category?.name ?? null,
    images: images.map((i) => i.url),
    features,
    variants: variants.map((v) => v.label),
  };
}

export function listProducts(
  tenantId: string,
  opts: { categorySlug?: string; q?: string; onlyActive?: boolean }
): (Product & { categoryName: string | null; thumbnail: string | null })[] {
  const clauses = ["p.tenant_id = ?"];
  const params: string[] = [tenantId];

  if (opts.onlyActive) {
    clauses.push("p.status = 'active'");
  }
  if (opts.categorySlug) {
    clauses.push("c.slug = ?");
    params.push(opts.categorySlug);
  }
  if (opts.q) {
    clauses.push("p.name LIKE ?");
    params.push(`%${opts.q}%`);
  }

  const rows = db
    .prepare(
      `SELECT p.*, c.name as categoryName,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position ASC LIMIT 1) as thumbnail
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY p.created_at DESC`
    )
    .all(...params) as unknown as (Product & {
      categoryName: string | null;
      thumbnail: string | null;
    })[];

  return rows;
}

export function replaceProductRelations(
  productId: string,
  images: string[],
  features: { label: string; value: string }[],
  variants: string[]
) {
  db.prepare("DELETE FROM product_images WHERE product_id = ?").run(productId);
  db.prepare("DELETE FROM product_features WHERE product_id = ?").run(productId);
  db.prepare("DELETE FROM product_variants WHERE product_id = ?").run(productId);

  const insertImage = db.prepare(
    "INSERT INTO product_images (id, product_id, url, position) VALUES (?, ?, ?, ?)"
  );
  const insertFeature = db.prepare(
    "INSERT INTO product_features (id, product_id, label, value, position) VALUES (?, ?, ?, ?, ?)"
  );
  const insertVariant = db.prepare(
    "INSERT INTO product_variants (id, product_id, label, position) VALUES (?, ?, ?, ?)"
  );

  images.forEach((url, i) => {
    insertImage.run(newId("img"), productId, url, i);
  });
  features.forEach((f, i) => {
    insertFeature.run(newId("feat"), productId, f.label, f.value, i);
  });
  variants.forEach((label, i) => {
    insertVariant.run(newId("var"), productId, label, i);
  });
}

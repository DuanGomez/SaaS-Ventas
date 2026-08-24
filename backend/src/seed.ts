import bcrypt from "bcryptjs";
import { db } from "./db";
import { newId, slugify } from "./utils";
import { replaceProductRelations } from "./products";

function upsertTenant(opts: {
  slug: string;
  name: string;
  whatsappNumber: string;
  accentColor: string;
  tagline: string;
  adminEmail: string;
  adminPassword: string;
  categories: string[];
  products: {
    name: string;
    price: number;
    description: string;
    category: string;
    features: { label: string; value: string }[];
    variants: string[];
  }[];
}) {
  const existing = db.prepare("SELECT id FROM tenants WHERE slug = ?").get(opts.slug) as
    | { id: string }
    | undefined;
  if (existing) {
    console.log(`Tenant "${opts.slug}" ya existe, se omite.`);
    return;
  }

  const tenantId = newId("tenant");
  db.prepare(
    `INSERT INTO tenants (id, slug, name, whatsapp_number, accent_color, tagline) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(tenantId, opts.slug, opts.name, opts.whatsappNumber, opts.accentColor, opts.tagline);

  const userId = newId("user");
  const passwordHash = bcrypt.hashSync(opts.adminPassword, 10);
  db.prepare(
    `INSERT INTO admin_users (id, tenant_id, email, password_hash) VALUES (?, ?, ?, ?)`
  ).run(userId, tenantId, opts.adminEmail, passwordHash);

  const categoryIds: Record<string, string> = {};
  for (const categoryName of opts.categories) {
    const categoryId = newId("cat");
    db.prepare(`INSERT INTO categories (id, tenant_id, name, slug) VALUES (?, ?, ?, ?)`).run(
      categoryId,
      tenantId,
      categoryName,
      slugify(categoryName)
    );
    categoryIds[categoryName] = categoryId;
  }

  for (const p of opts.products) {
    const productId = newId("prod");
    db.prepare(
      `INSERT INTO products (id, tenant_id, category_id, name, price, description, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`
    ).run(productId, tenantId, categoryIds[p.category] ?? null, p.name, p.price, p.description);

    replaceProductRelations(productId, [], p.features, p.variants);
  }

  console.log(`Tenant "${opts.slug}" creado con ${opts.products.length} productos.`);
  console.log(`  Admin: ${opts.adminEmail} / ${opts.adminPassword}`);
}

upsertTenant({
  slug: "nova",
  name: "NOVA Store",
  whatsappNumber: "573000000000",
  accentColor: "#4F46E5",
  tagline: "Tienda oficial de iPhone y accesorios",
  adminEmail: "admin@nova.com",
  adminPassword: "admin123",
  categories: ["iPhone", "Accesorios"],
  products: [
    {
      name: "iPhone 13",
      price: 2499000,
      description:
        "Equipo sellado, con garantía de la tienda. Buen rendimiento para el día a día y cámara doble para fotos y video.",
      category: "iPhone",
      features: [
        { label: "Pantalla", value: "6.1\" Super Retina XDR" },
        { label: "Chip", value: "A15 Bionic" },
        { label: "Cámara", value: "Dual 12MP, modo Noche" },
        { label: "Batería", value: "Hasta 19h de video" },
      ],
      variants: ["128GB", "256GB", "512GB"],
    },
    {
      name: "iPhone 13 Pro",
      price: 3299000,
      description: "Pantalla de 120Hz y triple cámara. Ideal si grabas mucho video o editas fotos.",
      category: "iPhone",
      features: [
        { label: "Pantalla", value: "6.1\" Super Retina XDR ProMotion" },
        { label: "Chip", value: "A15 Bionic" },
        { label: "Cámara", value: "Triple 12MP con LiDAR" },
      ],
      variants: ["128GB", "256GB", "1TB"],
    },
    {
      name: "AirPods Pro",
      price: 899000,
      description: "Con cancelación de ruido. Vienen en su caja original, sin abrir.",
      category: "Accesorios",
      features: [{ label: "Autonomía", value: "Hasta 4.5h por carga" }],
      variants: [],
    },
  ],
});

upsertTenant({
  slug: "urbanfeet",
  name: "UrbanFeet",
  whatsappNumber: "573000000001",
  accentColor: "#EA580C",
  tagline: "Zapatillas urbanas para toda ocasión",
  adminEmail: "admin@urbanfeet.com",
  adminPassword: "admin123",
  categories: ["Running", "Casual"],
  products: [
    {
      name: "Runner Air X",
      price: 349000,
      description: "Liviana, buena amortiguación. La uso yo mismo para correr y aguanta bien.",
      category: "Running",
      features: [
        { label: "Material", value: "Malla transpirable" },
        { label: "Suela", value: "Goma antideslizante" },
      ],
      variants: ["38", "39", "40", "41", "42"],
    },
    {
      name: "Street Classic",
      price: 259000,
      description: "El modelo que más se vende. Combina con todo, para uso diario.",
      category: "Casual",
      features: [{ label: "Material", value: "Cuero sintético" }],
      variants: ["38", "39", "40", "41", "42", "43"],
    },
  ],
});

upsertTenant({
  slug: "cafenube",
  name: "Café Nube",
  whatsappNumber: "573000000002",
  accentColor: "#7C4A2D",
  tagline: "Café de origen, tostado en pequeños lotes",
  adminEmail: "admin@cafenube.com",
  adminPassword: "admin123",
  categories: ["Grano", "Molido"],
  products: [
    {
      name: "Huila Especial",
      price: 42000,
      description: "Del mismo finquero desde hace 3 años. Sabe a panela, con un toque de frutos rojos.",
      category: "Grano",
      features: [
        { label: "Origen", value: "Huila, Colombia" },
        { label: "Tueste", value: "Medio" },
      ],
      variants: ["250g", "500g", "1kg"],
    },
    {
      name: "Nariño Reserva",
      price: 45000,
      description: "Molido para espresso. Dulce y achocolatado, el favorito de la casa.",
      category: "Molido",
      features: [{ label: "Origen", value: "Nariño, Colombia" }],
      variants: ["250g", "500g"],
    },
  ],
});

console.log("Seed completado.");

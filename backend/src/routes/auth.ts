import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { AdminUser, Tenant } from "../types";
import { signToken, requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { tenantSlug, email, password } = req.body as {
    tenantSlug?: string;
    email?: string;
    password?: string;
  };

  if (!tenantSlug || !email || !password) {
    return res.status(400).json({ error: "Faltan datos: tienda, correo o contraseña" });
  }

  const tenant = db.prepare("SELECT * FROM tenants WHERE slug = ?").get(tenantSlug) as unknown as
    | Tenant
    | undefined;
  if (!tenant) {
    return res.status(404).json({ error: "Tienda no encontrada" });
  }

  const user = db
    .prepare("SELECT * FROM admin_users WHERE tenant_id = ? AND email = ?")
    .get(tenant.id, email) as unknown as AdminUser | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }

  const token = signToken({ userId: user.id, tenantId: tenant.id, email: user.email });
  res.json({
    token,
    tenant: { slug: tenant.slug, name: tenant.name, accentColor: tenant.accent_color },
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const tenant = db.prepare("SELECT * FROM tenants WHERE id = ?").get(req.auth!.tenantId) as
    unknown as Tenant | undefined;
  if (!tenant) return res.status(404).json({ error: "Tienda no encontrada" });

  res.json({
    email: req.auth!.email,
    tenant: {
      slug: tenant.slug,
      name: tenant.name,
      whatsappNumber: tenant.whatsapp_number,
      accentColor: tenant.accent_color,
      tagline: tenant.tagline,
    },
  });
});

import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { Tenant } from "../types";

export function resolveTenant(req: Request, res: Response, next: NextFunction) {
  const slug = req.params.tenantSlug;
  const tenant = db
    .prepare("SELECT * FROM tenants WHERE slug = ?")
    .get(slug) as unknown as Tenant | undefined;

  if (!tenant) {
    return res.status(404).json({ error: "Tienda no encontrada" });
  }

  req.tenant = tenant;
  next();
}

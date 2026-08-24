export interface Tenant {
  id: string;
  slug: string;
  name: string;
  whatsapp_number: string;
  accent_color: string;
  tagline: string;
  font_key: string;
  logo_url: string | null;
  featured_product_id: string | null;
  hero_subtitle: string;
  hero_cta_label: string;
  purchase_note: string;
  contact_email: string | null;
  contact_address: string | null;
  views: number;
  created_at: string;
}

export interface AdminUser {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  price: number;
  description: string;
  status: "active" | "sold_out";
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
}

export interface ProductFeature {
  id: string;
  product_id: string;
  label: string;
  value: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  label: string;
  position: number;
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
      tenant?: Tenant;
    }
  }
}

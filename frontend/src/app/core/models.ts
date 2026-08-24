export interface StoreInfo {
  slug: string;
  name: string;
  whatsappNumber: string;
  accentColor: string;
  tagline: string;
  fontKey: string;
  logoUrl: string | null;
  featuredProductId: string | null;
  heroSubtitle: string;
  heroCtaLabel: string;
  purchaseNote: string;
  contactEmail: string | null;
  contactAddress: string | null;
}

export interface AdminStats {
  storeViews: number;
  totalProducts: number;
  activeProducts: number;
  soldOutProducts: number;
  totalCategories: number;
  topProducts: { id: string; name: string; price: number; views: number; thumbnail: string | null }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'sold_out';
  categoryName: string | null;
  thumbnail: string | null;
}

export interface ProductFeature {
  label: string;
  value: string;
}

export interface ProductDetail {
  id: string;
  category_id: string | null;
  categoryName: string | null;
  name: string;
  price: number;
  description: string;
  status: 'active' | 'sold_out';
  images: string[];
  features: ProductFeature[];
  variants: string[];
}

export interface ProductFormValue {
  name: string;
  price: number;
  description: string;
  categoryId: string | null;
  status: 'active' | 'sold_out';
  images: string[];
  features: ProductFeature[];
  variants: string[];
}

export interface LoginResponse {
  token: string;
  tenant: { slug: string; name: string; accentColor: string };
}

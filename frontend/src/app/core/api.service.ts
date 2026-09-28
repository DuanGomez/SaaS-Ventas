import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdminStats,
  Category,
  LoginResponse,
  ProductDetail,
  ProductFormValue,
  ProductSummary,
  StoreInfo,
} from './models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.apiUrl;

  private authHeaders(): Record<string, string> {
    const token = this.auth.token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ---- Public storefront ----

  getStore(tenant: string): Observable<StoreInfo> {
    return this.http.get<StoreInfo>(`${this.base}/store/${tenant}`);
  }

  getCategories(tenant: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/store/${tenant}/categories`);
  }

  getProducts(
    tenant: string,
    opts: { category?: string; q?: string } = {}
  ): Observable<ProductSummary[]> {
    const params: Record<string, string> = {};
    if (opts.category) params['category'] = opts.category;
    if (opts.q) params['q'] = opts.q;
    return this.http.get<ProductSummary[]>(`${this.base}/store/${tenant}/products`, { params });
  }

  getProduct(tenant: string, productId: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/store/${tenant}/products/${productId}`);
  }

  // ---- Auth ----

  login(tenantSlug: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, {
      tenantSlug,
      email,
      password,
    });
  }

  // ---- Admin: store settings ----

  getAdminStore(): Observable<StoreInfo> {
    return this.http.get<StoreInfo>(`${this.base}/admin/store`, { headers: this.authHeaders() });
  }

  updateAdminStore(payload: Partial<StoreInfo>): Observable<{ ok: true }> {
    return this.http.put<{ ok: true }>(`${this.base}/admin/store`, payload, {
      headers: this.authHeaders(),
    });
  }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/admin/stats`, { headers: this.authHeaders() });
  }

  // ---- Admin: categories ----

  getAdminCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/admin/categories`, {
      headers: this.authHeaders(),
    });
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(
      `${this.base}/admin/categories`,
      { name },
      { headers: this.authHeaders() }
    );
  }

  deleteCategory(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/admin/categories/${id}`, {
      headers: this.authHeaders(),
    });
  }

  // ---- Admin: products ----

  getAdminProducts(): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(`${this.base}/admin/products`, {
      headers: this.authHeaders(),
    });
  }

  getAdminProduct(id: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.base}/admin/products/${id}`, {
      headers: this.authHeaders(),
    });
  }

  createProduct(payload: ProductFormValue): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(`${this.base}/admin/products`, payload, {
      headers: this.authHeaders(),
    });
  }

  updateProduct(id: string, payload: ProductFormValue): Observable<ProductDetail> {
    return this.http.put<ProductDetail>(`${this.base}/admin/products/${id}`, payload, {
      headers: this.authHeaders(),
    });
  }

  deleteProduct(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/admin/products/${id}`, {
      headers: this.authHeaders(),
    });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.base}/admin/upload`, formData, {
      headers: this.authHeaders(),
    });
  }

  resolveAssetUrl(url: string): string {
    // En modo demo las imágenes son archivos del propio sitio (demo/*.svg) o data URLs.
    if (url.startsWith('http') || url.startsWith('data:') || environment.demo) return url;
    return `${this.base.replace(/\/api$/, '')}${url}`;
  }
}

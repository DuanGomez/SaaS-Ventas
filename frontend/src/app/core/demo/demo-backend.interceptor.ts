import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, delay, dematerialize, from, map, materialize, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DEMO_DB_VERSION, DemoDb, DemoProduct, DemoTenant, createDemoDb, newId, slugify,
} from './demo-data';

/**
 * Backend simulado para el modo demo (GitHub Pages). Replica las rutas, validaciones
 * y respuestas de la API Express de /backend, guardando los datos en localStorage.
 * Solo se registra cuando `environment.demo` es true.
 */

const STORAGE_KEY = 'saas-ventas:demo-db';
const LATENCY_MS = 200;
const FONT_KEYS = ['sora-jakarta', 'playfair-inter', 'poppins', 'spacegrotesk-work', 'dmserif-dmsans'];

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let cache: DemoDb | null = null;

function db(): DemoDb {
  if (cache) return cache;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored?.version === DEMO_DB_VERSION) return (cache = stored as DemoDb);
  } catch { /* datos corruptos: se regeneran */ }
  cache = createDemoDb();
  save();
  return cache;
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    throw new ApiError(507, 'El almacenamiento del navegador está lleno. Elimina algunas imágenes subidas.');
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function tenantBySlug(slug: string): DemoTenant {
  const tenant = db().tenants.find((t) => t.slug === slug);
  if (!tenant) throw new ApiError(404, 'Tienda no encontrada');
  return tenant;
}

function authTenant(req: HttpRequest<unknown>): DemoTenant {
  const header = req.headers.get('Authorization') ?? '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'No autenticado');
  const tenant = db().tenants.find((t) => header.slice(7) === `demo.${t.id}`);
  if (!tenant) throw new ApiError(401, 'Sesión inválida o expirada');
  return tenant;
}

const categoryName = (p: DemoProduct) => db().categories.find((c) => c.id === p.categoryId)?.name ?? null;

function storeInfo(t: DemoTenant) {
  const { id, views, adminEmail, adminPassword, ...info } = t;
  return info;
}

function listProducts(tenantId: string, opts: { categorySlug?: string | null; q?: string | null; onlyActive?: boolean }) {
  const category = opts.categorySlug
    ? db().categories.find((c) => c.tenantId === tenantId && c.slug === opts.categorySlug)
    : undefined;
  return db().products
    .filter((p) => p.tenantId === tenantId)
    .filter((p) => !opts.onlyActive || p.status === 'active')
    .filter((p) => !opts.categorySlug || (category && p.categoryId === category.id))
    .filter((p) => !opts.q || p.name.toLowerCase().includes(opts.q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const summary = (p: DemoProduct) => ({
  id: p.id, name: p.name, price: p.price, status: p.status,
  categoryName: categoryName(p), thumbnail: p.images[0] ?? null,
});

const detail = (p: DemoProduct) => ({
  id: p.id, category_id: p.categoryId, categoryName: categoryName(p), name: p.name, price: p.price,
  description: p.description, status: p.status, images: p.images, features: p.features, variants: p.variants,
});

function ownProduct(id: string, tenant: DemoTenant): DemoProduct {
  const product = db().products.find((p) => p.id === id && p.tenantId === tenant.id);
  if (!product) throw new ApiError(404, 'Producto no encontrado');
  return product;
}

function validateProduct(body: any, tenant: DemoTenant): void {
  if (!body?.name || !String(body.name).trim()) throw new ApiError(400, 'El nombre del producto es obligatorio');
  if (typeof body.price !== 'number' || body.price < 0) throw new ApiError(400, 'El precio debe ser un número válido');
  if (body.status && !['active', 'sold_out'].includes(body.status)) throw new ApiError(400, 'Estado no válido');
  if (body.categoryId && !db().categories.some((c) => c.id === body.categoryId && c.tenantId === tenant.id)) {
    throw new ApiError(400, 'Categoría no válida');
  }
}

/** Reduce la foto (máx. 1000 px, JPEG) para que quepa en localStorage. */
function compressImage(file: File): Promise<string> {
  if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.type)) {
    return Promise.reject(new ApiError(400, 'Formato de imagen no soportado'));
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      // Los logos PNG conservan transparencia; las fotos van en JPEG para ocupar menos.
      const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
      if (!keepAlpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL(keepAlpha ? 'image/webp' : 'image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new ApiError(400, 'No se pudo leer la imagen')); };
    img.src = url;
  });
}

// ─── Rutas ──────────────────────────────────────────────────────────────────

type Ctx = { req: HttpRequest<any>; body: any; params: URLSearchParams; m: string[]; tenant: () => DemoTenant };
type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

const routes: [string, RegExp, Handler][] = [];
const route = (method: string, pattern: string, handler: Handler) =>
  routes.push([method, new RegExp(`^${pattern.replace(/:\w+/g, '([^/]+)')}$`), handler]);

// Públicas
route('GET', 'store/:slug', ({ m }) => {
  const tenant = tenantBySlug(m[0]);
  tenant.views += 1;
  save();
  return storeInfo(tenant);
});
route('GET', 'store/:slug/categories', ({ m }) => {
  const tenant = tenantBySlug(m[0]);
  return db().categories
    .filter((c) => c.tenantId === tenant.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, slug }) => ({ id, name, slug }));
});
route('GET', 'store/:slug/products', ({ m, params }) =>
  listProducts(tenantBySlug(m[0]).id, { categorySlug: params.get('category'), q: params.get('q'), onlyActive: true })
    .map(summary));
route('GET', 'store/:slug/products/:id', ({ m }) => {
  const tenant = tenantBySlug(m[0]);
  const product = db().products.find((p) => p.id === m[1] && p.tenantId === tenant.id);
  if (!product || product.status !== 'active') throw new ApiError(404, 'Producto no encontrado');
  product.views += 1;
  save();
  return detail(product);
});

// Auth
route('POST', 'auth/login', ({ body }) => {
  if (!body?.tenantSlug || !body?.email || !body?.password) {
    throw new ApiError(400, 'Faltan datos: tienda, correo o contraseña');
  }
  const tenant = tenantBySlug(body.tenantSlug);
  if (tenant.adminEmail !== String(body.email).trim().toLowerCase() || tenant.adminPassword !== body.password) {
    throw new ApiError(401, 'Correo o contraseña incorrectos');
  }
  return { token: `demo.${tenant.id}`, tenant: { slug: tenant.slug, name: tenant.name, accentColor: tenant.accentColor } };
});

// Admin: tienda y estadísticas
route('GET', 'admin/store', ({ tenant }) => {
  const { slug, ...info } = storeInfo(tenant());
  return info;
});
route('PUT', 'admin/store', ({ tenant, body }) => {
  const t = tenant();
  if (body?.fontKey && !FONT_KEYS.includes(body.fontKey)) throw new ApiError(400, 'Tipografía no válida');
  if (body?.featuredProductId && !db().products.some((p) => p.id === body.featuredProductId && p.tenantId === t.id)) {
    throw new ApiError(400, 'Producto destacado no válido');
  }
  const editable = [
    'name', 'whatsappNumber', 'accentColor', 'tagline', 'fontKey', 'logoUrl', 'featuredProductId',
    'heroSubtitle', 'heroCtaLabel', 'purchaseNote', 'contactEmail', 'contactAddress',
  ] as const;
  for (const key of editable) {
    if (body && Object.prototype.hasOwnProperty.call(body, key)) (t as any)[key] = body[key];
  }
  save();
  return { ok: true };
});
route('GET', 'admin/stats', ({ tenant }) => {
  const t = tenant();
  const products = db().products.filter((p) => p.tenantId === t.id);
  return {
    storeViews: t.views,
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.status === 'active').length,
    soldOutProducts: products.filter((p) => p.status === 'sold_out').length,
    totalCategories: db().categories.filter((c) => c.tenantId === t.id).length,
    topProducts: [...products]
      .sort((a, b) => b.views - a.views || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, price: p.price, views: p.views, thumbnail: p.images[0] ?? null })),
  };
});

// Admin: categorías
route('GET', 'admin/categories', ({ tenant }) => {
  const t = tenant();
  return db().categories
    .filter((c) => c.tenantId === t.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, slug }) => ({ id, name, slug }));
});
route('POST', 'admin/categories', ({ tenant, body }) => {
  const t = tenant();
  const name = String(body?.name ?? '').trim();
  if (!name) throw new ApiError(400, 'El nombre es obligatorio');
  const slug = slugify(name);
  if (db().categories.some((c) => c.tenantId === t.id && c.slug === slug)) {
    throw new ApiError(409, 'Ya existe una categoría con ese nombre');
  }
  const category = { id: newId('cat'), tenantId: t.id, name, slug };
  db().categories.push(category);
  save();
  return { id: category.id, name, slug };
});
route('DELETE', 'admin/categories/:id', ({ tenant, m }) => {
  const t = tenant();
  const category = db().categories.find((c) => c.id === m[0] && c.tenantId === t.id);
  if (!category) throw new ApiError(404, 'Categoría no encontrada');
  db().categories = db().categories.filter((c) => c.id !== category.id);
  db().products.forEach((p) => { if (p.categoryId === category.id) p.categoryId = null; });
  save();
  return { ok: true };
});

// Admin: productos
route('GET', 'admin/products', ({ tenant }) =>
  listProducts(tenant().id, {}).map((p) => ({ ...summary(p), views: p.views, description: p.description })));
route('GET', 'admin/products/:id', ({ tenant, m }) => detail(ownProduct(m[0], tenant())));
route('POST', 'admin/products', ({ tenant, body }) => {
  const t = tenant();
  validateProduct(body, t);
  const now = new Date().toISOString();
  const product: DemoProduct = {
    id: newId('prod'), tenantId: t.id, categoryId: body.categoryId ?? null, name: String(body.name).trim(),
    price: body.price, description: body.description ?? '', status: body.status ?? 'active', views: 0,
    images: body.images ?? [], features: body.features ?? [], variants: body.variants ?? [],
    createdAt: now, updatedAt: now,
  };
  db().products.push(product);
  save();
  return detail(product);
});
route('PUT', 'admin/products/:id', ({ tenant, body, m }) => {
  const t = tenant();
  const product = ownProduct(m[0], t);
  validateProduct(body, t);
  Object.assign(product, {
    categoryId: body.categoryId ?? null, name: String(body.name).trim(), price: body.price,
    description: body.description ?? '', status: body.status ?? 'active',
    images: body.images ?? [], features: body.features ?? [], variants: body.variants ?? [],
    updatedAt: new Date().toISOString(),
  });
  save();
  return detail(product);
});
route('DELETE', 'admin/products/:id', ({ tenant, m }) => {
  const t = tenant();
  const product = ownProduct(m[0], t);
  db().products = db().products.filter((p) => p.id !== product.id);
  if (t.featuredProductId === product.id) t.featuredProductId = null;
  save();
  return { ok: true };
});
route('POST', 'admin/upload', async ({ tenant, body }) => {
  tenant();
  const file = body instanceof FormData ? body.get('image') : null;
  if (!(file instanceof File)) throw new ApiError(400, 'No se recibió ninguna imagen');
  if (file.size > 5 * 1024 * 1024) throw new ApiError(400, 'La imagen supera 5 MB');
  return { url: await compressImage(file) };
});

// ─── Interceptor ────────────────────────────────────────────────────────────

export const demoBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const prefix = `${environment.apiUrl}/`;
  if (!req.url.startsWith(prefix)) return next(req);

  const [path, query = ''] = req.url.slice(prefix.length).split('?');
  const params = new URLSearchParams(query);
  req.params.keys().forEach((k) => params.set(k, req.params.get(k)!));

  const toError = (e: unknown) => {
    const err = e instanceof ApiError ? e : new ApiError(500, 'Error interno del servidor');
    if (!(e instanceof ApiError)) console.error(e);
    return new HttpErrorResponse({ status: err.status, url: req.url, error: { error: err.message } });
  };

  const found = routes.find(([method, pattern]) => method === req.method && pattern.test(path));
  const run = async () => {
    if (!found) throw new ApiError(404, `Cannot ${req.method} /api/${path}`);
    const [, pattern, handler] = found;
    const m = path.match(pattern)!.slice(1).map(decodeURIComponent);
    const ctx: Ctx = { req, body: req.body, params, m, tenant: () => authTenant(req) };
    // Las rutas admin exigen token antes de ejecutar nada, como el middleware requireAuth.
    if (path.startsWith('admin/')) ctx.tenant();
    return handler(ctx);
  };

  return from(run()).pipe(
    map((data) => new HttpResponse({ status: 200, body: data, url: req.url })),
    catchError((e) => throwError(() => toError(e))),
    // materialize/dematerialize para que el retraso aplique también a los errores.
    materialize(),
    delay(LATENCY_MS),
    dematerialize(),
  );
};

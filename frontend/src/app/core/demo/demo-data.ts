/**
 * Catálogo de ejemplo del modo demo (GitHub Pages). Replica el seed del backend
 * y le agrega ilustraciones de producto (public/demo/*.svg).
 */

export const DEMO_PASSWORD = 'admin123';

export interface DemoTenant {
  id: string;
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
  views: number;
  adminEmail: string;
  adminPassword: string;
}

export interface DemoCategory { id: string; tenantId: string; name: string; slug: string; }

export interface DemoProduct {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  price: number;
  description: string;
  status: 'active' | 'sold_out';
  views: number;
  images: string[];
  features: { label: string; value: string }[];
  variants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoDb {
  version: number;
  tenants: DemoTenant[];
  categories: DemoCategory[];
  products: DemoProduct[];
}

export const DEMO_DB_VERSION = 1;

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 14)}`;
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type SeedProduct = Omit<DemoProduct, 'id' | 'tenantId' | 'categoryId' | 'createdAt' | 'updatedAt'> & { category: string };

interface SeedTenant {
  tenant: Omit<DemoTenant, 'id' | 'featuredProductId'>;
  categories: string[];
  featured: string;
  products: SeedProduct[];
}

const SEED: SeedTenant[] = [
  {
    tenant: {
      slug: 'nova', name: 'NOVA Store', whatsappNumber: '573000000000', accentColor: '#4F46E5',
      tagline: 'Tienda oficial de iPhone y accesorios', fontKey: 'sora-jakarta', logoUrl: null,
      heroSubtitle: 'Equipos sellados con garantía, entrega el mismo día en Bogotá.',
      heroCtaLabel: 'Ver catálogo',
      purchaseNote: 'Te atendemos directo por WhatsApp para confirmar disponibilidad, pago y envío.',
      contactEmail: 'ventas@novastore.co', contactAddress: 'Bogotá, Centro Comercial Andino', views: 1284,
      adminEmail: 'admin@nova.com', adminPassword: DEMO_PASSWORD,
    },
    categories: ['iPhone', 'Accesorios'],
    featured: 'iPhone 15',
    products: [
      {
        name: 'iPhone 15', price: 3899000, category: 'iPhone', status: 'active', views: 412,
        description: 'Dynamic Island, cámara de 48 MP y puerto USB-C. Sellado, con un año de garantía.',
        images: ['demo/iphone-15.svg'],
        features: [
          { label: 'Pantalla', value: '6.1" Super Retina XDR' }, { label: 'Chip', value: 'A16 Bionic' },
          { label: 'Cámara', value: '48 MP principal + ultra gran angular' }, { label: 'Conector', value: 'USB-C' },
        ],
        variants: ['128GB', '256GB', '512GB'],
      },
      {
        name: 'iPhone 13 Pro', price: 3299000, category: 'iPhone', status: 'active', views: 238,
        description: 'Pantalla de 120Hz y triple cámara. Ideal si grabas mucho video o editas fotos.',
        images: ['demo/iphone-13-pro.svg'],
        features: [
          { label: 'Pantalla', value: '6.1" Super Retina XDR ProMotion' }, { label: 'Chip', value: 'A15 Bionic' },
          { label: 'Cámara', value: 'Triple 12MP con LiDAR' },
        ],
        variants: ['128GB', '256GB', '1TB'],
      },
      {
        name: 'iPhone 13', price: 2499000, category: 'iPhone', status: 'active', views: 305,
        description: 'Equipo sellado, con garantía de la tienda. Buen rendimiento para el día a día y cámara doble para fotos y video.',
        images: ['demo/iphone-13.svg'],
        features: [
          { label: 'Pantalla', value: '6.1" Super Retina XDR' }, { label: 'Chip', value: 'A15 Bionic' },
          { label: 'Cámara', value: 'Dual 12MP, modo Noche' }, { label: 'Batería', value: 'Hasta 19h de video' },
        ],
        variants: ['128GB', '256GB', '512GB'],
      },
      {
        name: 'AirPods Pro', price: 899000, category: 'Accesorios', status: 'active', views: 176,
        description: 'Con cancelación de ruido. Vienen en su caja original, sin abrir.',
        images: ['demo/airpods-pro.svg'],
        features: [{ label: 'Autonomía', value: 'Hasta 4.5h por carga' }, { label: 'Estuche', value: 'Carga MagSafe' }],
        variants: [],
      },
      {
        name: 'Funda MagSafe', price: 129000, category: 'Accesorios', status: 'active', views: 94,
        description: 'Silicona suave al tacto con imanes alineados para cargadores MagSafe.',
        images: ['demo/funda-magsafe.svg'],
        features: [{ label: 'Material', value: 'Silicona' }],
        variants: ['iPhone 13', 'iPhone 13 Pro', 'iPhone 15'],
      },
      {
        name: 'Cargador USB-C 20W', price: 99000, category: 'Accesorios', status: 'sold_out', views: 58,
        description: 'Carga rápida: 50% de batería en unos 30 minutos.',
        images: ['demo/cargador-20w.svg'],
        features: [{ label: 'Potencia', value: '20 W' }],
        variants: [],
      },
    ],
  },
  {
    tenant: {
      slug: 'urbanfeet', name: 'UrbanFeet', whatsappNumber: '573000000001', accentColor: '#EA580C',
      tagline: 'Zapatillas urbanas para toda ocasión', fontKey: 'poppins', logoUrl: null,
      heroSubtitle: 'Envíos a todo el país y cambios de talla sin costo.',
      heroCtaLabel: 'Ver zapatillas',
      purchaseNote: 'Escríbenos con tu talla y te confirmamos disponibilidad y envío.',
      contactEmail: 'hola@urbanfeet.co', contactAddress: 'Medellín, El Poblado', views: 642,
      adminEmail: 'admin@urbanfeet.com', adminPassword: DEMO_PASSWORD,
    },
    categories: ['Running', 'Casual', 'Accesorios'],
    featured: 'Runner Air X',
    products: [
      {
        name: 'Runner Air X', price: 349000, category: 'Running', status: 'active', views: 221,
        description: 'Liviana, buena amortiguación. La uso yo mismo para correr y aguanta bien.',
        images: ['demo/runner-air-x.svg'],
        features: [{ label: 'Material', value: 'Malla transpirable' }, { label: 'Suela', value: 'Goma antideslizante' }],
        variants: ['38', '39', '40', '41', '42'],
      },
      {
        name: 'Trail Pro GTX', price: 429000, category: 'Running', status: 'active', views: 133,
        description: 'Para montaña y lluvia: membrana impermeable y agarre en terreno suelto.',
        images: ['demo/trail-pro.svg'],
        features: [{ label: 'Impermeable', value: 'Sí' }, { label: 'Drop', value: '6 mm' }],
        variants: ['39', '40', '41', '42', '43'],
      },
      {
        name: 'Street Classic', price: 259000, category: 'Casual', status: 'active', views: 187,
        description: 'El modelo que más se vende. Combina con todo, para uso diario.',
        images: ['demo/street-classic.svg'],
        features: [{ label: 'Material', value: 'Cuero sintético' }],
        variants: ['38', '39', '40', '41', '42', '43'],
      },
      {
        name: 'Canvas Low', price: 189000, category: 'Casual', status: 'active', views: 76,
        description: 'Lona resistente y suela vulcanizada. Clásicas, cómodas y fáciles de lavar.',
        images: ['demo/canvas-low.svg'],
        features: [{ label: 'Material', value: 'Lona de algodón' }],
        variants: ['36', '37', '38', '39', '40', '41'],
      },
      {
        name: 'Medias deportivas x3', price: 39000, category: 'Accesorios', status: 'active', views: 41,
        description: 'Pack de tres pares con refuerzo en talón y puntera.',
        images: ['demo/medias-pack.svg'],
        features: [{ label: 'Composición', value: 'Algodón y poliéster' }],
        variants: ['S', 'M', 'L'],
      },
    ],
  },
  {
    tenant: {
      slug: 'cafenube', name: 'Café Nube', whatsappNumber: '573000000002', accentColor: '#7C4A2D',
      tagline: 'Café de origen, tostado en pequeños lotes', fontKey: 'playfair-inter', logoUrl: null,
      heroSubtitle: 'Tostamos cada semana y enviamos a domicilio en toda Colombia.',
      heroCtaLabel: 'Ver cafés',
      purchaseNote: 'Cuéntanos cómo lo preparas y te recomendamos la molienda ideal.',
      contactEmail: 'pedidos@cafenube.co', contactAddress: 'Pereira, Risaralda', views: 389,
      adminEmail: 'admin@cafenube.com', adminPassword: DEMO_PASSWORD,
    },
    categories: ['Grano', 'Molido', 'Accesorios'],
    featured: 'Huila Especial',
    products: [
      {
        name: 'Huila Especial', price: 42000, category: 'Grano', status: 'active', views: 164,
        description: 'Del mismo finquero desde hace 3 años. Sabe a panela, con un toque de frutos rojos.',
        images: ['demo/huila-especial.svg'],
        features: [{ label: 'Origen', value: 'Huila, Colombia' }, { label: 'Tueste', value: 'Medio' }],
        variants: ['250g', '500g', '1kg'],
      },
      {
        name: 'Nariño Reserva', price: 45000, category: 'Molido', status: 'active', views: 121,
        description: 'Molido para espresso. Dulce y achocolatado, el favorito de la casa.',
        images: ['demo/narino-reserva.svg'],
        features: [{ label: 'Origen', value: 'Nariño, Colombia' }],
        variants: ['250g', '500g'],
      },
      {
        name: 'Sierra Nevada', price: 39000, category: 'Grano', status: 'active', views: 68,
        description: 'Notas cítricas y cuerpo ligero. Perfecto para métodos de filtrado.',
        images: ['demo/sierra-nevada.svg'],
        features: [{ label: 'Origen', value: 'Sierra Nevada de Santa Marta' }, { label: 'Tueste', value: 'Claro' }],
        variants: ['250g', '500g'],
      },
      {
        name: 'Prensa francesa 600 ml', price: 129000, category: 'Accesorios', status: 'active', views: 37,
        description: 'Vidrio borosilicato y filtro de acero. Cuatro tazas en cuatro minutos.',
        images: ['demo/prensa-francesa.svg'],
        features: [{ label: 'Capacidad', value: '600 ml' }],
        variants: [],
      },
      {
        name: 'Cold brew concentrado', price: 28000, category: 'Molido', status: 'active', views: 52,
        description: 'Extracción en frío de 18 horas. Mézclalo con agua o leche y hielo.',
        images: ['demo/cold-brew.svg'],
        features: [{ label: 'Presentación', value: 'Botella 500 ml' }],
        variants: [],
      },
    ],
  },
];

export function createDemoDb(): DemoDb {
  const db: DemoDb = { version: DEMO_DB_VERSION, tenants: [], categories: [], products: [] };
  const now = Date.now();

  for (const seed of SEED) {
    const tenant: DemoTenant = { ...seed.tenant, id: newId('tenant'), featuredProductId: null };
    db.tenants.push(tenant);

    const categoryIds = new Map<string, string>();
    for (const name of seed.categories) {
      const category = { id: newId('cat'), tenantId: tenant.id, name, slug: slugify(name) };
      db.categories.push(category);
      categoryIds.set(name, category.id);
    }

    // El catálogo se lista "más recientes primero": el primer producto del seed es el más nuevo.
    seed.products.forEach(({ category, ...p }, i) => {
      const createdAt = new Date(now - i * 86400000).toISOString();
      const product: DemoProduct = {
        ...p, id: newId('prod'), tenantId: tenant.id, categoryId: categoryIds.get(category) ?? null,
        createdAt, updatedAt: createdAt,
      };
      db.products.push(product);
      if (p.name === seed.featured) tenant.featuredProductId = product.id;
    });
  }
  return db;
}

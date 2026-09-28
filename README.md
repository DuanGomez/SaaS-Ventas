# SaaS Ventas

SaaS multi-tenant para vender cualquier producto (celulares, zapatos, café,
comida, etc.) a través de una vitrina web organizada por categorías, donde
la compra se cierra por WhatsApp en vez de un checkout tradicional. Cada
tenant (negocio) tiene su propia tienda pública y su propio panel de
administración para configurar productos: fotos, precio, descripción,
características y variantes.

Diseñado y desarrollado por **[Dcodea](https://www.instagram.com/dcod.ea/)**.

## Demo en vivo (GitHub Pages)

Cada push a `main` publica el frontend en GitHub Pages en **modo demo**: la API se
simula en el navegador (`frontend/src/app/core/demo/`) con los mismos endpoints y
validaciones que el backend, y los datos se guardan en `localStorage`. Se puede
navegar las tiendas, entrar al panel, crear productos, subir fotos y cambiar la marca.

Requisito único: en el repositorio, **Settings → Pages → Source: GitHub Actions**.

Para correr el modo demo en local: `cd frontend && npm install && npm start`.

## Diseño

La interfaz sigue el ADN visual de Dcodea (`frontend/src/dcodea-dna.css`: tipografía
Inter, botones píldora, superficies de vidrio, fondos oscuros con cuadrícula) y cada
tienda conserva su propio color de marca y tipografía. Los mockups originales están
en `design/*.dc.html`.

## Arquitectura

```
backend/    API REST en Node.js + TypeScript + Express (SQLite embebido, sin ORM)
frontend/   Angular + TypeScript (standalone components, signals)
design/     Mockups de referencia (Design Components)
```

- **Multi-tenant**: cada tienda vive bajo su propio `slug` (`/nova`,
  `/urbanfeet`, `/cafenube`...). El backend filtra todo por `tenant_id`.
- **Sin checkout propio**: el botón de compra arma un enlace
  `https://wa.me/<numero>?text=...` con el producto, variante, cantidad y
  precio, y abre WhatsApp. El número de WhatsApp de cada tienda se
  configura desde `Admin > Configuración`.
- **Panel admin por tenant**: cada negocio inicia sesión con su propio
  correo/contraseña y solo ve y edita su propio catálogo (autenticación
  con JWT).

## Requisitos

- Node.js 22.5+ (usa el módulo nativo `node:sqlite`, sin dependencias
  nativas que compilar).

## Puesta en marcha

### 1. Backend (API)

```bash
cd backend
npm install
npm run seed   # crea 3 tiendas de ejemplo con productos
npm run dev    # http://localhost:3000
```

### 2. Frontend (Angular)

```bash
cd frontend
npm install
npm run start:api   # http://localhost:4200 contra la API local (npm start = modo demo)
```

Abre `http://localhost:4200` para ver el listado de tiendas de ejemplo.

## Tiendas y credenciales de ejemplo

| Tienda (slug) | Rubro           | Admin                  | Contraseña |
|---------------|-----------------|-------------------------|------------|
| `nova`        | Celulares/iPhone| admin@nova.com          | admin123   |
| `urbanfeet`   | Zapatos         | admin@urbanfeet.com     | admin123   |
| `cafenube`    | Café            | admin@cafenube.com      | admin123   |

- Tienda pública: `http://localhost:4200/<slug>`
- Panel admin: `http://localhost:4200/<slug>/admin`

## Estructura de rutas (frontend)

- `/` — landing con las tiendas de ejemplo
- `/:tenant` — catálogo público (categorías, buscador, tarjetas de producto)
- `/:tenant/producto/:id` — ficha de producto con botón "Comprar por WhatsApp"
- `/:tenant/admin/login` — login del panel admin
- `/:tenant/admin/panel` — panel general: visitas a la tienda, productos activos/agotados, categorías y ranking de productos más vistos
- `/:tenant/admin/productos` — listado/gestión de productos
- `/:tenant/admin/productos/nuevo` y `/:id/editar` — alta/edición de producto
- `/:tenant/admin/configuracion` — identidad de marca (logo, nombre, color, tipografía), copys de la página de inicio, producto destacado, contacto (WhatsApp, correo, dirección) y mensaje de compra

## API (resumen)

Públicas:
- `GET /api/store/:tenant`
- `GET /api/store/:tenant/categories`
- `GET /api/store/:tenant/products`
- `GET /api/store/:tenant/products/:id`

Autenticación:
- `POST /api/auth/login`

Admin (requieren `Authorization: Bearer <token>`):
- `GET/POST /api/admin/products`, `GET/PUT/DELETE /api/admin/products/:id`
- `GET/POST /api/admin/categories`, `DELETE /api/admin/categories/:id`
- `GET/PUT /api/admin/store`
- `GET /api/admin/stats` (visitas, conteo de productos/categorías, top 5 más vistos)
- `POST /api/admin/upload` (fotos de producto y logo, multipart/form-data)

## Notas

- La base de datos es un archivo SQLite (`backend/data.sqlite`) creado
  automáticamente al arrancar el servidor.
- Las fotos subidas se guardan en `backend/uploads/<tenant_id>/` y se
  sirven en `/uploads/...`.
- Para agregar un nuevo tenant hoy se hace por script (ver
  `backend/src/seed.ts` como referencia); no hay todavía un flujo de
  autoregistro de tiendas.

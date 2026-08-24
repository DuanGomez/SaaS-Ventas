import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DemoTenant {
  slug: string;
  name: string;
  category: string;
  accent: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <header class="hero">
        <div class="badge">SaaS multi-tenant</div>
        <h1>Una tienda por WhatsApp, para cualquier producto.</h1>
        <p>
          Cada negocio (tenant) tiene su propia vitrina y su propio panel de administración.
          Celulares, zapatos, café o lo que vendas: organizas tu catálogo y tus clientes te
          escriben directo por WhatsApp para comprar.
        </p>
      </header>

      <section class="tenants">
        <h2>Tiendas de ejemplo</h2>
        <div class="grid">
          @for (t of demoTenants; track t.slug) {
            <a class="card" [routerLink]="['/', t.slug]" [style.--accent]="t.accent">
              <div class="dot"></div>
              <div class="name">{{ t.name }}</div>
              <div class="category">{{ t.category }}</div>
              <div class="links">
                <span>Ver tienda →</span>
              </div>
            </a>
          }
        </div>
      </section>

      <section class="admin-hint">
        <p>
          ¿Quieres administrar una tienda? Entra a
          <code>/{{ '{' }}tienda{{ '}' }}/admin</code>
          con las credenciales de ejemplo (ver README del proyecto).
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--bg);
      }
      .wrap {
        max-width: 960px;
        margin: 0 auto;
        padding: 96px 32px 64px;
        display: flex;
        flex-direction: column;
        gap: 56px;
      }
      .hero {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 640px;
      }
      .badge {
        width: fit-content;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 13px;
        font-weight: 700;
        padding: 7px 14px;
        border-radius: 100px;
      }
      h1 {
        font-size: 40px;
        line-height: 1.15;
        letter-spacing: -0.02em;
        font-weight: 800;
      }
      .hero p {
        font-size: 16px;
        line-height: 1.7;
        color: var(--ink-soft);
        margin: 0;
      }
      h2 {
        font-size: 15px;
        font-weight: 700;
        color: var(--ink-soft);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 20px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;
      }
      .card:hover {
        transform: translateY(-3px);
        box-shadow: 0 20px 40px -24px rgba(19, 19, 22, 0.25);
      }
      .dot {
        width: 12px;
        height: 12px;
        border-radius: 100px;
        background: var(--accent);
        margin-bottom: 8px;
      }
      .name {
        font-size: 18px;
        font-weight: 700;
      }
      .category {
        font-size: 14px;
        color: var(--ink-faint);
      }
      .links {
        margin-top: 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--accent);
      }
      .admin-hint {
        border-top: 1px solid var(--border);
        padding-top: 24px;
      }
      .admin-hint p {
        margin: 0;
        font-size: 14px;
        color: var(--ink-faint);
      }
      code {
        background: var(--surface-alt);
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 13px;
      }
    `,
  ],
})
export class LandingComponent {
  readonly demoTenants: DemoTenant[] = [
    { slug: 'nova', name: 'NOVA Store', category: 'Tecnología · iPhone', accent: '#4F46E5' },
    { slug: 'urbanfeet', name: 'UrbanFeet', category: 'Calzado', accent: '#EA580C' },
    { slug: 'cafenube', name: 'Café Nube', category: 'Café de origen', accent: '#7C4A2D' },
  ];
}

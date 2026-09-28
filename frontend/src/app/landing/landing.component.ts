import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DcodeaBadgeComponent } from '../core/dcodea-badge.component';

interface DemoTenant {
  slug: string;
  name: string;
  category: string;
  accent: string;
  image: string;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, DcodeaBadgeComponent],
  template: `
    <div class="page dc-dark">
      <header class="top">
        <div class="logo"><span class="mark"></span>SaaS Ventas</div>
        <app-dcodea-badge />
      </header>

      <section class="hero dc-rise">
        <div class="dc-chip">Dcodea · Proyecto SaaS multi-tenant</div>
        <h1>Una tienda por WhatsApp, <span class="dc-gradient-text">para cualquier producto.</span></h1>
        <p>
          Cada negocio tiene su propia vitrina y su propio panel de administración.
          Celulares, zapatos, café o lo que vendas: organizas tu catálogo y tus clientes
          te escriben directo por WhatsApp para comprar.
        </p>
        <div class="stats">
          <div><strong>3</strong><span>tiendas de ejemplo</span></div>
          <div><strong>1</strong><span>panel por negocio</span></div>
          <div><strong>0</strong><span>pasarelas de pago</span></div>
        </div>
      </section>

      <section class="tenants">
        <h2>Tiendas de ejemplo</h2>
        <div class="grid">
          @for (t of demoTenants; track t.slug; let i = $index) {
            <article class="card dc-glass dc-rise" [style.--accent]="t.accent" [style.animation-delay.ms]="120 + i * 90">
              <div class="thumb"><img [src]="t.image" [alt]="t.name" /></div>
              <div class="body">
                <div class="category">{{ t.category }}</div>
                <div class="name">{{ t.name }}</div>
                <div class="links">
                  <a class="primary dc-sheen" [routerLink]="['/', t.slug]">Ver tienda</a>
                  <a class="secondary" [routerLink]="['/', t.slug, 'admin']">Panel admin →</a>
                </div>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="how">
        @for (step of steps; track step.title; let i = $index) {
          <div class="step dc-glass">
            <span class="num">0{{ i + 1 }}</span>
            <div class="step-title">{{ step.title }}</div>
            <p>{{ step.text }}</p>
          </div>
        }
      </section>

      <footer class="foot">
        <p>
          Cada tienda tiene su panel en <code>/{{ '{' }}tienda{{ '}' }}/admin</code> · Credenciales:
          <code>admin&#64;{{ '{' }}tienda{{ '}' }}.com</code> / <code>admin123</code>
        </p>
        <app-dcodea-badge />
      </footer>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        --brand: #22a556;
        --brand-2: #00e5ff;
        padding: 0 clamp(16px, 5vw, 64px) 48px;
        font-family: var(--dc-font);
      }
      .top {
        max-width: 1120px;
        margin: 0 auto;
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 18px;
        letter-spacing: -0.02em;
      }
      .mark {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        box-shadow: 0 8px 28px -6px color-mix(in srgb, var(--brand) 70%, transparent);
      }
      .hero {
        max-width: 860px;
        margin: 0 auto;
        padding: clamp(56px, 10vw, 120px) 0 clamp(48px, 8vw, 88px);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 22px;
      }
      h1 {
        font-family: var(--dc-font);
        font-size: clamp(40px, 7vw, 76px);
        line-height: 1.02;
        font-weight: 800;
        letter-spacing: -0.045em;
      }
      .hero p {
        max-width: 620px;
        margin: 0;
        font-size: clamp(17px, 2vw, 20px);
        line-height: 1.55;
        color: rgba(245, 245, 247, 0.68);
      }
      .stats {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px 40px;
        margin-top: 12px;
      }
      .stats div {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .stats strong {
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }
      .stats span {
        font-size: 13px;
        color: rgba(245, 245, 247, 0.5);
      }
      .tenants,
      .how,
      .foot {
        max-width: 1120px;
        margin: 0 auto;
      }
      h2 {
        font-family: var(--dc-font);
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(245, 245, 247, 0.5);
        margin-bottom: 20px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 20px;
      }
      .card {
        border-radius: var(--dc-radius-lg);
        overflow: hidden;
        transition: transform 0.4s var(--dc-ease), box-shadow 0.4s ease;
      }
      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 50%, transparent),
          0 24px 60px -24px color-mix(in srgb, var(--accent) 70%, transparent);
      }
      .thumb {
        height: 190px;
        overflow: hidden;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s var(--dc-ease);
      }
      .card:hover .thumb img {
        transform: scale(1.05);
      }
      .body {
        padding: 20px 22px 24px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .category {
        font-size: 13px;
        color: color-mix(in srgb, var(--accent) 45%, white);
        font-weight: 600;
      }
      .name {
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.03em;
      }
      .links {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 18px;
        margin-top: 14px;
        font-size: 14px;
        font-weight: 600;
      }
      .links .primary {
        padding: 10px 18px;
        border-radius: var(--dc-radius-pill);
        background: var(--accent);
        color: #fff;
      }
      .links .secondary {
        color: rgba(245, 245, 247, 0.7);
      }
      .links .secondary:hover {
        color: #fff;
      }
      .how {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
        margin-top: 56px;
      }
      .step {
        border-radius: var(--dc-radius-md);
        padding: 22px;
      }
      .num {
        font-family: var(--dc-mono);
        font-size: 13px;
        color: var(--brand-2);
      }
      .step-title {
        font-weight: 700;
        font-size: 17px;
        margin: 8px 0 6px;
        letter-spacing: -0.02em;
      }
      .step p {
        margin: 0;
        font-size: 14px;
        line-height: 1.55;
        color: rgba(245, 245, 247, 0.6);
      }
      .foot {
        margin-top: 56px;
        padding-top: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .foot p {
        margin: 0;
        font-size: 13px;
        color: rgba(245, 245, 247, 0.55);
        line-height: 1.8;
      }
      code {
        font-family: var(--dc-mono);
        background: rgba(255, 255, 255, 0.08);
        padding: 2px 7px;
        border-radius: 6px;
        font-size: 12px;
        color: #f5f5f7;
      }
    `,
  ],
})
export class LandingComponent {
  readonly demoTenants: DemoTenant[] = [
    { slug: 'nova', name: 'NOVA Store', category: 'Tecnología · iPhone', accent: '#4F46E5', image: 'demo/iphone-15.svg' },
    { slug: 'urbanfeet', name: 'UrbanFeet', category: 'Calzado', accent: '#EA580C', image: 'demo/runner-air-x.svg' },
    { slug: 'cafenube', name: 'Café Nube', category: 'Café de origen', accent: '#7C4A2D', image: 'demo/huila-especial.svg' },
  ];

  readonly steps = [
    { title: 'Arma tu catálogo', text: 'Fotos, precio, variantes y características desde un panel propio para cada negocio.' },
    { title: 'Personaliza tu marca', text: 'Logo, color, tipografía y textos de la portada sin tocar una línea de código.' },
    { title: 'Vende por WhatsApp', text: 'El cliente elige variante y cantidad; el pedido llega armado a tu chat.' },
  ];
}

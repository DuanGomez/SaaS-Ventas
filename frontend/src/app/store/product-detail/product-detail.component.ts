import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { WhatsappService } from '../../core/whatsapp.service';
import { ProductDetail, StoreInfo } from '../../core/models';
import { StoreNavComponent } from '../store-nav/store-nav.component';
import { StoreFooterComponent } from '../store-footer/store-footer.component';
import { CopCurrencyPipe } from '../../core/cop-currency.pipe';
import { FontLoaderService } from '../../core/font-loader.service';
import { getFontOption } from '../../core/fonts';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, StoreNavComponent, StoreFooterComponent, CopCurrencyPipe],
  template: `
    @if (store(); as s) {
      @if (product(); as p) {
        <div
          class="page tenant-theme"
          [style.--accent]="s.accentColor"
          [style.--font-heading]="fontOption().heading"
          [style.--font-body]="fontOption().body"
        >
          <app-store-nav [store]="s" />

          <div class="crumb">
            <a [routerLink]="['/', s.slug]">Inicio</a>
            <span>/</span>
            <span class="current">{{ p.name }}</span>
          </div>

          <div class="main">
            <div class="gallery">
              <div class="main-image">
                @if (activeImage(); as img) {
                  <img [src]="resolveUrl(img)" [alt]="p.name" />
                } @else {
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
                    <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
                    <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                  </svg>
                }
                @if (selectedVariant(); as v) {
                  <div class="image-badge">{{ v }}</div>
                }
              </div>
              @if (p.images.length > 1) {
                <div class="thumbs">
                  @for (img of p.images; track img) {
                    <button
                      class="thumb"
                      [class.active]="img === activeImage()"
                      (click)="activeImage.set(img)"
                    >
                      <img [src]="resolveUrl(img)" [alt]="p.name" />
                    </button>
                  }
                </div>
              }
            </div>

            <div class="info">
              @if (p.categoryName) {
                <div class="category">{{ p.categoryName }}</div>
              }
              <h1>{{ p.name }}</h1>
              <div class="price">{{ p.price | copCurrency }}</div>

              <p class="description">{{ p.description }}</p>

              @if (p.variants.length) {
                <div class="field">
                  <div class="label">Variante</div>
                  <div class="pills">
                    @for (v of p.variants; track v) {
                      <button
                        class="pill"
                        [class.active]="v === selectedVariant()"
                        (click)="selectedVariant.set(v)"
                      >
                        {{ v }}
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="buy-row">
                <div class="stepper">
                  <button (click)="quantity.set(Math.max(1, quantity() - 1))">−</button>
                  <span>{{ quantity() }}</span>
                  <button (click)="quantity.set(quantity() + 1)">+</button>
                </div>

                @if (p.status === 'active') {
                  <a class="wa-buy dc-sheen" [href]="whatsappLink(s, p)" target="_blank" rel="noopener">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 3C7.03 3 3 7.03 3 12c0 1.77.52 3.42 1.42 4.8L3 21l4.35-1.4A8.9 8.9 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Z"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M8.6 8.4c.2-.5.5-.5.7-.5h.5c.16 0 .38 0 .55.4.2.5.68 1.75.74 1.87.06.13.1.28.02.45-.08.17-.13.28-.26.43-.13.15-.27.34-.39.46-.13.13-.26.26-.11.5.15.26.68 1.12 1.46 1.82.99.9 1.83 1.18 2.09 1.31.26.13.4.11.55-.07.15-.17.63-.73.8-.98.17-.25.34-.2.56-.12.23.08 1.45.68 1.7.81.24.13.4.19.46.3.06.11.06.63-.15 1.24-.21.6-1.23 1.15-1.7 1.22-.44.07-1 .1-1.6-.1-.37-.12-.85-.28-1.46-.55-2.58-1.12-4.26-3.73-4.4-3.9-.13-.17-1.05-1.4-1.05-2.66 0-1.26.66-1.87.9-2.13Z"
                        fill="currentColor"
                      />
                    </svg>
                    Comprar por WhatsApp
                  </a>
                } @else {
                  <div class="sold-out-msg">Agotado por ahora</div>
                }
              </div>
              <div class="hint">
                {{ s.purchaseNote || 'Te atendemos directo por WhatsApp para confirmar disponibilidad, pago y envío.' }}
              </div>

              @if (p.features.length) {
                <div class="features">
                  <div class="features-title">Características</div>
                  <div class="features-grid">
                    @for (f of p.features; track f.label) {
                      <div class="feature">
                        <span class="f-label">{{ f.label }}</span>
                        <span class="f-value">{{ f.value }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <app-store-footer [store]="s" />
        </div>
      }
    } @else if (notFound()) {
      <div class="not-found">
        <h1>Producto no encontrado</h1>
        <a [routerLink]="['/', tenant]">Volver a la tienda</a>
      </div>
    }
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: var(--bg);
        font-family: var(--font-body);
      }
      .crumb {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 24px clamp(20px, 5vw, 64px) 0;
        font-size: 14px;
        color: var(--ink-faint);
      }
      .crumb a {
        color: var(--ink-faint);
      }
      .crumb a:hover {
        color: var(--ink);
      }
      .current {
        color: var(--ink);
        font-weight: 600;
      }
      .main {
        display: flex;
        flex-wrap: wrap;
        gap: 48px;
        padding: 24px clamp(20px, 5vw, 64px) 64px;
      }
      .gallery {
        flex: 1 1 420px;
        max-width: 520px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .main-image {
        position: relative;
        height: 440px;
        border-radius: 24px;
        background: linear-gradient(160deg, var(--accent-soft), color-mix(in srgb, var(--accent) 20%, white));
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .main-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .image-badge {
        position: absolute;
        top: 24px;
        right: 24px;
        background: #fff;
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
        box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.25);
      }
      .thumbs {
        display: flex;
        gap: 12px;
      }
      .thumb {
        width: 90px;
        height: 90px;
        border-radius: 14px;
        border: 2px solid var(--border);
        overflow: hidden;
        background: var(--surface-alt);
        padding: 0;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb.active {
        border-color: var(--ink);
      }
      .info {
        flex: 1 1 420px;
        max-width: 520px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .category {
        font-size: 13px;
        font-weight: 700;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      h1 {
        font-size: 34px;
        letter-spacing: -0.02em;
        font-weight: 800;
      }
      .price {
        font-size: 24px;
        font-weight: 800;
      }
      .description {
        margin: 0;
        font-size: 15px;
        line-height: 1.7;
        color: var(--ink-soft);
      }
      .field .label {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .pills {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .pill {
        padding: 10px 18px;
        border-radius: 100px;
        border: 1px solid var(--border);
        font-size: 14px;
        font-weight: 600;
        background: var(--surface);
      }
      .pill.active {
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
      }
      .buy-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .stepper {
        display: flex;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: 100px;
        overflow: hidden;
      }
      .stepper button {
        width: 40px;
        height: 44px;
        font-size: 18px;
      }
      .stepper span {
        width: 32px;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
      }
      .wa-buy {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 24px;
        border-radius: 100px;
        font-size: 16px;
        font-weight: 700;
        background: var(--whatsapp);
        color: #fff;
        transition: background 0.15s ease;
      }
      .wa-buy:hover {
        background: var(--whatsapp-dark);
      }
      .sold-out-msg {
        flex: 1;
        text-align: center;
        padding: 14px;
        border-radius: 100px;
        background: var(--surface-alt);
        color: var(--ink-faint);
        font-weight: 700;
      }
      .hint {
        font-size: 13px;
        color: var(--ink-faint);
        margin-top: -6px;
      }
      .features {
        border-top: 1px solid var(--border);
        padding-top: 20px;
      }
      .features-title {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 14px;
      }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 24px;
      }
      .feature {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .f-label {
        font-size: 12px;
        color: var(--ink-faint);
      }
      .f-value {
        font-size: 14px;
        font-weight: 600;
      }
      .not-found {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
    `,
  ],
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private whatsapp = inject(WhatsappService);
  private fontLoader = inject(FontLoaderService);
  private titleService = inject(Title);

  protected Math = Math;

  tenant = this.route.snapshot.paramMap.get('tenant')!;
  productId = this.route.snapshot.paramMap.get('id')!;

  store = signal<StoreInfo | null>(null);
  product = signal<ProductDetail | null>(null);
  notFound = signal(false);

  activeImage = signal<string | null>(null);
  selectedVariant = signal<string | null>(null);
  quantity = signal(1);

  fontOption = computed(() => getFontOption(this.store()?.fontKey));

  constructor() {
    this.api.getStore(this.tenant).subscribe({
      next: (s) => {
        this.store.set(s);
        this.fontLoader.ensureLoaded(s.fontKey);
        this.updateTitle();
      },
      error: () => this.notFound.set(true),
    });
    this.api.getProduct(this.tenant, this.productId).subscribe({
      next: (p) => {
        this.product.set(p);
        this.activeImage.set(p.images[0] ?? null);
        this.selectedVariant.set(p.variants[0] ?? null);
        this.updateTitle();
      },
      error: () => this.notFound.set(true),
    });
  }

  private updateTitle(): void {
    const productName = this.product()?.name;
    const storeName = this.store()?.name;
    if (productName && storeName) this.titleService.setTitle(`${productName} · ${storeName}`);
    else if (storeName) this.titleService.setTitle(storeName);
  }

  resolveUrl(url: string): string {
    return this.api.resolveAssetUrl(url);
  }

  whatsappLink(store: StoreInfo, product: ProductDetail): string {
    return this.whatsapp.buildLink(
      store.whatsappNumber,
      this.whatsapp.buildProductMessage({
        storeName: store.name,
        productName: product.name,
        price: product.price,
        variant: this.selectedVariant(),
        quantity: this.quantity(),
      })
    );
  }
}

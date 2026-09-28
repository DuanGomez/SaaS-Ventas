import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Category, ProductSummary, StoreInfo } from '../../core/models';
import { StoreNavComponent } from '../store-nav/store-nav.component';
import { StoreFooterComponent } from '../store-footer/store-footer.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CopCurrencyPipe } from '../../core/cop-currency.pipe';
import { FontLoaderService } from '../../core/font-loader.service';
import { getFontOption } from '../../core/fonts';

@Component({
  selector: 'app-store-home',
  imports: [StoreNavComponent, StoreFooterComponent, ProductCardComponent, CopCurrencyPipe],
  template: `
    @if (store(); as s) {
      <div
        class="page tenant-theme"
        [style.--accent]="s.accentColor"
        [style.--font-heading]="fontOption().heading"
        [style.--font-body]="fontOption().body"
      >
        <app-store-nav [store]="s" />

        <section class="hero">
          <div class="copy dc-rise">
            <div class="badge dc-chip">{{ s.name }}</div>
            <h1>{{ s.tagline || 'Catálogo disponible por WhatsApp' }}</h1>
            <p>{{ s.heroSubtitle || 'Explora el catálogo y escríbenos directo por WhatsApp para comprar.' }}</p>
            <div class="cta-row">
              <button class="cta-btn dc-sheen" type="button" (click)="scrollToCatalog()">{{ s.heroCtaLabel || 'Ver catálogo' }}</button>
              @if (cheapestPrice(); as price) {
                <button class="price-link" type="button" (click)="scrollToCatalog()">
                  Desde {{ price | copCurrency }}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              }
            </div>
          </div>

          <div class="hero-visual dc-rise">
            @if (heroProduct(); as hp) {
              @if (hp.thumbnail) {
                <img [src]="resolveUrl(hp.thumbnail)" [alt]="hp.name" />
              } @else {
                <svg class="hero-icon" width="120" height="120" viewBox="0 0 24 24" fill="none">
                  <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                </svg>
              }
              <div class="floating-badge">{{ hp.name }}</div>
            } @else {
              <svg class="hero-icon" width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
              </svg>
            }
          </div>
        </section>

        <section class="toolbar" id="catalogo">
          <div class="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
              <path d="M21 21l-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              [value]="query()"
              (input)="onSearch($any($event.target).value)"
            />
          </div>
          <div class="chips">
            <button
              class="chip"
              [class.active]="!selectedCategory()"
              (click)="selectCategory(null)"
            >
              Todos
            </button>
            @for (c of categories(); track c.id) {
              <button
                class="chip"
                [class.active]="selectedCategory() === c.slug"
                (click)="selectCategory(c.slug)"
              >
                {{ c.name }}
              </button>
            }
          </div>
        </section>

        <section class="grid-wrap">
          @if (loading()) {
            <div class="empty">Cargando catálogo...</div>
          } @else if (products().length === 0) {
            <div class="empty">No encontramos productos con ese filtro.</div>
          } @else {
            <div class="grid">
              @for (p of products(); track p.id) {
                <app-product-card [product]="p" [store]="s" />
              }
            </div>
          }
        </section>

        <app-store-footer [store]="s" />
      </div>
    } @else if (notFound()) {
      <div class="not-found">
        <h1>Tienda no encontrada</h1>
        <p>Revisa el enlace o vuelve al inicio.</p>
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
      .hero {
        padding: 80px clamp(20px, 5vw, 64px) 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 40px;
        flex-wrap: wrap;
      }
      .copy {
        max-width: 520px;
        display: flex;
        flex-direction: column;
        gap: 22px;
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
        font-size: clamp(30px, 4vw, 46px);
        line-height: 1.1;
        letter-spacing: -0.02em;
        font-weight: 800;
      }
      .copy p {
        margin: 0;
        font-size: 16px;
        color: var(--ink-soft);
        max-width: 440px;
      }
      .cta-row {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-top: 4px;
      }
      .cta-btn {
        padding: 16px 30px;
        border-radius: 100px;
        font-size: 15px;
        font-weight: 600;
        background: var(--ink);
        color: #fff;
        transition: background 0.15s ease;
      }
      .cta-btn:hover {
        background: #2c2c31;
      }
      .price-link {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--ink);
      }
      .hero-visual {
        position: relative;
        width: min(480px, 90vw);
        height: 380px;
        border-radius: 32px;
        background: linear-gradient(160deg, var(--accent-soft), color-mix(in srgb, var(--accent) 20%, white));
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }
      .hero-visual img {
        max-width: 70%;
        max-height: 78%;
        object-fit: contain;
        border-radius: 16px;
      }
      .hero-icon {
        color: var(--accent);
        opacity: 0.9;
      }
      .floating-badge {
        position: absolute;
        top: 24px;
        right: 24px;
        background: #fff;
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 700;
        box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.25);
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .toolbar {
        padding: 0 clamp(20px, 5vw, 64px) 32px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .search {
        max-width: 340px;
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 11px 16px;
        color: var(--ink-faint);
      }
      .search input {
        border: none;
        outline: none;
        font-size: 14px;
        width: 100%;
        background: none;
        color: var(--ink);
      }
      .chips {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .chip {
        padding: 10px 20px;
        border-radius: 100px;
        border: 1px solid var(--border);
        font-size: 14px;
        font-weight: 600;
        background: var(--surface);
        color: var(--ink);
        transition: border-color 0.15s ease;
      }
      .chip:hover {
        border-color: var(--ink);
      }
      .chip.active {
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
      }
      .grid-wrap {
        padding: 0 clamp(20px, 5vw, 64px) 80px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 24px;
      }
      .empty {
        padding: 60px 0;
        text-align: center;
        color: var(--ink-faint);
        font-size: 15px;
      }
      .not-found {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-align: center;
      }
    `,
  ],
})
export class StoreHomeComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private fontLoader = inject(FontLoaderService);
  private titleService = inject(Title);

  tenant = this.route.snapshot.paramMap.get('tenant')!;

  store = signal<StoreInfo | null>(null);
  categories = signal<Category[]>([]);
  products = signal<ProductSummary[]>([]);
  allProducts = signal<ProductSummary[]>([]);
  loading = signal(true);
  notFound = signal(false);
  selectedCategory = signal<string | null>(null);
  query = signal('');

  fontOption = computed(() => getFontOption(this.store()?.fontKey));

  heroProduct = computed(() => {
    const featuredId = this.store()?.featuredProductId;
    const all = this.allProducts();
    return (
      (featuredId ? all.find((p) => p.id === featuredId) : undefined) ??
      all.find((p) => p.thumbnail) ??
      all[0] ??
      null
    );
  });

  cheapestPrice = computed(() => {
    const prices = this.allProducts().map((p) => p.price);
    return prices.length ? Math.min(...prices) : null;
  });

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.api.getStore(this.tenant).subscribe({
      next: (s) => {
        this.store.set(s);
        this.fontLoader.ensureLoaded(s.fontKey);
        this.titleService.setTitle(s.name);
      },
      error: () => this.notFound.set(true),
    });
    this.api.getCategories(this.tenant).subscribe((c) => this.categories.set(c));
    this.api.getProducts(this.tenant).subscribe((products) => this.allProducts.set(products));
    this.loadProducts();
  }

  resolveUrl(url: string): string {
    return this.api.resolveAssetUrl(url);
  }

  scrollToCatalog(): void {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.api
      .getProducts(this.tenant, {
        category: this.selectedCategory() ?? undefined,
        q: this.query() || undefined,
      })
      .subscribe((products) => {
        this.products.set(products);
        this.loading.set(false);
      });
  }

  selectCategory(slug: string | null): void {
    this.selectedCategory.set(slug);
    this.loadProducts();
  }

  onSearch(value: string): void {
    this.query.set(value);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadProducts(), 300);
  }
}

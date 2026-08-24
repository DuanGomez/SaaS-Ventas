import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ProductSummary } from '../../core/models';
import { CopCurrencyPipe } from '../../core/cop-currency.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, CopCurrencyPipe],
  template: `
    <div class="head">
      <div>
        <h1>Productos</h1>
        <div class="sub">Gestiona el catálogo que ven tus clientes</div>
      </div>
      <a class="new-btn" routerLink="nuevo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Nuevo producto
      </a>
    </div>

    <div class="toolbar">
      <div class="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
          <path d="M21 21l-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Buscar producto..."
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
      </div>
    </div>

    <div class="table">
      <div class="row header">
        <div></div>
        <div>Producto</div>
        <div>Categoría</div>
        <div>Precio</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>

      @if (loading()) {
        <div class="empty">Cargando productos...</div>
      } @else if (filtered().length === 0) {
        <div class="empty">Aún no tienes productos. Crea el primero.</div>
      } @else {
        @for (p of filtered(); track p.id) {
          <div class="row">
            <div class="thumb">
              @if (p.thumbnail) {
                <img [src]="resolveUrl(p.thumbnail)" alt="" />
              }
            </div>
            <div class="name">{{ p.name }}</div>
            <div class="muted">{{ p.categoryName ?? '—' }}</div>
            <div class="price">{{ p.price | copCurrency }}</div>
            <div>
              <span class="status" [class.sold-out]="p.status === 'sold_out'">
                {{ p.status === 'active' ? 'Activo' : 'Agotado' }}
              </span>
            </div>
            <div class="actions">
              <a class="icon-btn" [routerLink]="[p.id, 'editar']" title="Editar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
              <button class="icon-btn danger" title="Eliminar" (click)="remove(p)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4h8v2m-1 0v14a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V6h6Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
      }
      h1 {
        font-size: 26px;
        font-weight: 800;
      }
      .sub {
        font-size: 14px;
        color: var(--ink-faint);
        margin-top: 4px;
      }
      .new-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 13px 22px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        background: var(--ink);
        color: #fff;
      }
      .toolbar {
        margin-bottom: 20px;
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
      .table {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        overflow: hidden;
      }
      .row {
        display: grid;
        grid-template-columns: 56px 3fr 1.4fr 1.2fr 1fr 100px;
        gap: 16px;
        padding: 14px 24px;
        align-items: center;
        border-bottom: 1px solid var(--surface-alt);
      }
      .row:last-child {
        border-bottom: none;
      }
      .row.header {
        font-size: 12px;
        font-weight: 700;
        color: var(--ink-faint);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 1px solid var(--border);
      }
      .row:not(.header):hover {
        background: var(--bg);
      }
      .thumb {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--accent-soft);
        overflow: hidden;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .name {
        font-size: 14px;
        font-weight: 700;
      }
      .muted {
        font-size: 14px;
        color: var(--ink-soft);
      }
      .price {
        font-size: 14px;
        font-weight: 700;
      }
      .status {
        font-size: 12px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 100px;
        background: var(--success-bg);
        color: var(--success-ink);
      }
      .status.sold-out {
        background: var(--surface-alt);
        color: var(--ink-faint);
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ink-soft);
        transition: background 0.15s ease;
      }
      .icon-btn:hover {
        background: var(--surface-alt);
      }
      .icon-btn.danger {
        color: var(--danger);
      }
      .empty {
        padding: 60px 0;
        text-align: center;
        color: var(--ink-faint);
        font-size: 14px;
      }
    `,
  ],
})
export class AdminDashboardComponent {
  private api = inject(ApiService);

  products = signal<ProductSummary[]>([]);
  loading = signal(true);
  query = signal('');

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter((p) => p.name.toLowerCase().includes(q));
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.getAdminProducts().subscribe((products) => {
      this.products.set(products);
      this.loading.set(false);
    });
  }

  resolveUrl(url: string): string {
    return this.api.resolveAssetUrl(url);
  }

  remove(p: ProductSummary): void {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    this.api.deleteProduct(p.id).subscribe(() => this.refresh());
  }
}

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AdminStats } from '../../core/models';
import { CopCurrencyPipe } from '../../core/cop-currency.pipe';

@Component({
  selector: 'app-admin-overview',
  imports: [RouterLink, CopCurrencyPipe],
  template: `
    <div class="head">
      <div>
        <h1>Panel general</h1>
        <div class="sub">Un vistazo rápido a cómo le está yendo a tu tienda</div>
      </div>
    </div>

    @if (loading()) {
      <div class="empty">Cargando estadísticas...</div>
    } @else if (stats(); as s) {
      <div class="tiles">
        <div class="tile">
          <div class="tile-label">Visitas a la tienda</div>
          <div class="tile-value">{{ s.storeViews }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Productos activos</div>
          <div class="tile-value">{{ s.activeProducts }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Agotados</div>
          <div class="tile-value">{{ s.soldOutProducts }}</div>
        </div>
        <div class="tile">
          <div class="tile-label">Categorías</div>
          <div class="tile-value">{{ s.totalCategories }}</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Productos más vistos</div>
        @if (s.topProducts.length === 0) {
          <div class="empty">Aún no hay vistas registradas. Comparte el link de tu tienda para empezar a ver datos aquí.</div>
        } @else {
          <div class="rank-list">
            @for (p of s.topProducts; track p.id; let i = $index) {
              <a class="rank-row" [routerLink]="['/', tenant, 'admin', 'productos', p.id, 'editar']">
                <div class="rank-index">{{ i + 1 }}</div>
                <div class="rank-thumb">
                  @if (p.thumbnail) {
                    <img [src]="resolveUrl(p.thumbnail)" alt="" />
                  }
                </div>
                <div class="rank-name">{{ p.name }}</div>
                <div class="rank-price">{{ p.price | copCurrency }}</div>
                <div class="rank-views">{{ p.views }} {{ p.views === 1 ? 'vista' : 'vistas' }}</div>
              </a>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .head {
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
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
        margin-bottom: 28px;
      }
      .tile {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .tile-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-faint);
      }
      .tile-value {
        font-size: 30px;
        font-weight: 800;
      }
      .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 24px;
      }
      .panel-title {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 16px;
      }
      .rank-list {
        display: flex;
        flex-direction: column;
      }
      .rank-row {
        display: grid;
        grid-template-columns: 24px 44px 3fr 1fr 1fr;
        gap: 16px;
        align-items: center;
        padding: 12px 8px;
        border-bottom: 1px solid var(--surface-alt);
        color: var(--ink);
        transition: background 0.15s ease;
      }
      .rank-row:last-child {
        border-bottom: none;
      }
      .rank-row:hover {
        background: var(--bg);
      }
      .rank-index {
        font-size: 14px;
        font-weight: 700;
        color: var(--ink-faint);
      }
      .rank-thumb {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--accent-soft);
        overflow: hidden;
      }
      .rank-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .rank-name {
        font-size: 14px;
        font-weight: 700;
      }
      .rank-price {
        font-size: 14px;
        color: var(--ink-soft);
      }
      .rank-views {
        font-size: 13px;
        font-weight: 600;
        color: var(--accent);
        text-align: right;
      }
      .empty {
        color: var(--ink-faint);
        font-size: 14px;
        padding: 20px 0;
      }
    `,
  ],
})
export class AdminOverviewComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  tenant = this.route.snapshot.parent!.paramMap.get('tenant')!;

  loading = signal(true);
  stats = signal<AdminStats | null>(null);

  constructor() {
    this.api.getAdminStats().subscribe((s) => {
      this.stats.set(s);
      this.loading.set(false);
    });
  }

  resolveUrl(url: string): string {
    return this.api.resolveAssetUrl(url);
  }
}

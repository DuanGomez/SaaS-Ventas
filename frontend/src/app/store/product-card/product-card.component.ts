import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductSummary, StoreInfo } from '../../core/models';
import { WhatsappService } from '../../core/whatsapp.service';
import { ApiService } from '../../core/api.service';
import { CopCurrencyPipe } from '../../core/cop-currency.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CopCurrencyPipe],
  template: `
    <a class="card" [routerLink]="['/', store().slug, 'producto', product().id]">
      <div class="thumb">
        @if (product().thumbnail) {
          <img [src]="resolvedThumbnail()" [alt]="product().name" />
        } @else {
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
        }
        @if (product().status === 'sold_out') {
          <div class="sold-out">Agotado</div>
        }
      </div>
      <div class="info">
        @if (product().categoryName) {
          <div class="category">{{ product().categoryName }}</div>
        }
        <div class="name">{{ product().name }}</div>
      </div>
      <div class="row">
        <div class="price">{{ product().price | copCurrency }}</div>
        <button
          class="wa-icon"
          type="button"
          (click)="quickWhatsapp($event)"
          [disabled]="product().status === 'sold_out'"
          aria-label="Consultar por WhatsApp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
        </button>
      </div>
    </a>
  `,
  styles: [
    `
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        color: var(--ink);
        max-width: 340px;
        margin: 0 auto;
        width: 100%;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }
      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px -20px rgba(19, 19, 22, 0.25);
      }
      .thumb {
        position: relative;
        height: 200px;
        border-radius: 14px;
        background: linear-gradient(160deg, var(--accent-soft), color-mix(in srgb, var(--accent) 14%, white));
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .sold-out {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(19, 19, 22, 0.85);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 100px;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .category {
        font-size: 11px;
        font-weight: 700;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .name {
        font-size: 17px;
        font-weight: 700;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .price {
        font-size: 17px;
        font-weight: 800;
      }
      .wa-icon {
        width: 38px;
        height: 38px;
        border-radius: 100px;
        background: var(--whatsapp);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
      }
      .wa-icon:hover:not(:disabled) {
        background: var(--whatsapp-dark);
      }
      .wa-icon:disabled {
        background: var(--border);
        color: var(--ink-faint);
        cursor: not-allowed;
      }
    `,
  ],
})
export class ProductCardComponent {
  product = input.required<ProductSummary>();
  store = input.required<StoreInfo>();

  constructor(
    private whatsapp: WhatsappService,
    private api: ApiService
  ) {}

  resolvedThumbnail(): string {
    return this.api.resolveAssetUrl(this.product().thumbnail!);
  }

  quickWhatsapp(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const link = this.whatsapp.buildLink(
      this.store().whatsappNumber,
      this.whatsapp.buildProductMessage({
        storeName: this.store().name,
        productName: this.product().name,
        price: this.product().price,
      })
    );
    window.open(link, '_blank', 'noopener');
  }
}

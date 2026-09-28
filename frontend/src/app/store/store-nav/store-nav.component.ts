import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreInfo } from '../../core/models';
import { WhatsappService } from '../../core/whatsapp.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-store-nav',
  imports: [RouterLink],
  template: `
    <div class="nav">
      <a class="brand" [routerLink]="['/', store().slug]">
        @if (store().logoUrl) {
          <img class="logo" [src]="resolvedLogo()" [alt]="store().name" />
        } @else {
          {{ store().name }}<span class="dot">.</span>
        }
      </a>
      <div class="actions">
        <a class="wa-btn dc-sheen" [href]="waLink()" target="_blank" rel="noopener">
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
          Escríbenos
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .nav {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 clamp(20px, 5vw, 64px);
        height: 84px;
        background: rgba(250, 250, 247, 0.72);
        backdrop-filter: blur(14px) saturate(170%);
        -webkit-backdrop-filter: blur(14px) saturate(170%);
        border-bottom: 1px solid var(--border);
      }
      .brand {
        font-family: var(--font-heading);
        font-weight: 800;
        font-size: 22px;
        color: var(--ink);
        display: flex;
        align-items: center;
      }
      .logo {
        height: 40px;
        width: auto;
        max-width: 160px;
        object-fit: contain;
      }
      .dot {
        color: var(--accent);
      }
      .wa-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        background: var(--whatsapp);
        color: #fff;
        transition: background 0.15s ease;
      }
      .wa-btn:hover {
        background: var(--whatsapp-dark);
      }
    `,
  ],
})
export class StoreNavComponent {
  store = input.required<StoreInfo>();

  constructor(
    private whatsapp: WhatsappService,
    private api: ApiService
  ) {}

  resolvedLogo(): string {
    return this.api.resolveAssetUrl(this.store().logoUrl!);
  }

  waLink(): string {
    return this.whatsapp.buildLink(
      this.store().whatsappNumber,
      `Hola ${this.store().name}! Tengo una pregunta sobre sus productos.`
    );
  }
}

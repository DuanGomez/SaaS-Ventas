import { DcodeaBadgeComponent } from '../../core/dcodea-badge.component';
import { Component, input } from '@angular/core';
import { StoreInfo } from '../../core/models';

@Component({
  selector: 'app-store-footer',
  imports: [DcodeaBadgeComponent],
  template: `
    <div class="footer">
      <div class="top">
        <div class="brand-col">
          <div class="brand">{{ store().name }}<span class="dot">.</span></div>
          <div class="tagline">{{ store().tagline }}</div>
        </div>
        <div class="contact-col">
          <div class="label">Contacto</div>
          <div>WhatsApp: {{ store().whatsappNumber }}</div>
          @if (store().contactEmail) {
            <div>{{ store().contactEmail }}</div>
          }
          @if (store().contactAddress) {
            <div>{{ store().contactAddress }}</div>
          }
        </div>
      </div>
      <div class="bottom">
        <span>© {{ year }} {{ store().name }}. Todos los derechos reservados.</span>
        <app-dcodea-badge />
      </div>
    </div>
  `,
  styles: [
    `
      .footer {
        background: var(--dc-navy);
        color: #fff;
        padding: 56px clamp(20px, 5vw, 64px) 32px;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }
      .top {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 32px;
      }
      .brand {
        font-family: var(--font-heading);
        font-weight: 800;
        font-size: 22px;
      }
      .dot {
        color: color-mix(in srgb, var(--accent) 70%, white);
      }
      .tagline {
        margin-top: 10px;
        font-size: 14px;
        color: #a2a2a8;
        max-width: 320px;
        line-height: 1.6;
      }
      .label {
        font-size: 13px;
        font-weight: 700;
        color: #a2a2a8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 10px;
      }
      .contact-col {
        font-size: 14px;
        color: #e6e4de;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .bottom {
        border-top: 1px solid #2c2c31;
        padding-top: 20px;
        font-size: 13px;
        color: #7c7c82;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
    `,
  ],
})
export class StoreFooterComponent {
  store = input.required<StoreInfo>();
  year = new Date().getFullYear();
}

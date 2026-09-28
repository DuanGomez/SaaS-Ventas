import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { FONT_OPTIONS } from '../../core/fonts';
import { ProductSummary } from '../../core/models';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule],
  template: `
    <div class="head">
      <h1>Configuración de la tienda</h1>
      <div class="sub">Personaliza casi todo lo que ven tus clientes en la vitrina pública</div>
    </div>

    @if (loading()) {
      <div class="empty">Cargando...</div>
    } @else {
      <div class="sections">
        <!-- IDENTIDAD -->
        <section class="card">
          <div class="card-title">Identidad de marca</div>
          <div class="card-body">
            <div class="field">
              <label>Logo de la tienda</label>
              <div class="logo-row">
                <div class="logo-preview">
                  @if (logoUrl()) {
                    <img [src]="resolveUrl(logoUrl()!)" alt="Logo" />
                  } @else {
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    </svg>
                  }
                </div>
                <input #logoInput type="file" accept="image/*" hidden (change)="onLogoSelected($any($event.target).files); $any($event.target).value = ''" />
                <button class="btn-ghost" type="button" (click)="logoInput.click()">
                  {{ uploadingLogo() ? 'Subiendo...' : logoUrl() ? 'Cambiar logo' : 'Subir logo' }}
                </button>
                @if (logoUrl()) {
                  <button class="btn-text" type="button" (click)="logoUrl.set(null)">Quitar</button>
                }
              </div>
              <div class="hint">Si no subes un logo, se muestra el nombre de la tienda en el menú.</div>
            </div>

            <div class="field-row">
              <div class="field">
                <label>Nombre de la tienda</label>
                <input type="text" [(ngModel)]="name" />
              </div>
              <div class="field">
                <label>Color de marca</label>
                <div class="color-row">
                  <input type="color" [(ngModel)]="accentColor" />
                  <span class="color-value">{{ accentColor }}</span>
                </div>
              </div>
            </div>

            <div class="field">
              <label>Tipografía de la tienda</label>
              <select [(ngModel)]="fontKey">
                @for (f of fontOptions; track f.key) {
                  <option [value]="f.key">{{ f.label }}</option>
                }
              </select>
            </div>
          </div>
        </section>

        <!-- PAGINA DE INICIO -->
        <section class="card">
          <div class="card-title">Página de inicio</div>
          <div class="card-body">
            <div class="field">
              <label>Descripción corta (insignia y encabezado)</label>
              <textarea rows="2" [(ngModel)]="tagline" placeholder="Ej: Tienda oficial de iPhone y accesorios"></textarea>
            </div>
            <div class="field">
              <label>Texto debajo del encabezado</label>
              <textarea rows="2" [(ngModel)]="heroSubtitle" placeholder="Explora el catálogo y escríbenos directo por WhatsApp para comprar."></textarea>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Texto del botón principal</label>
                <input type="text" [(ngModel)]="heroCtaLabel" placeholder="Ver catálogo" />
              </div>
              <div class="field">
                <label>Producto destacado</label>
                <select [ngModel]="featuredProductId" (ngModelChange)="featuredProductId.set($event)">
                  <option [ngValue]="null">Automático (el primero con foto)</option>
                  @for (p of products(); track p.id) {
                    <option [ngValue]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- CONTACTO -->
        <section class="card">
          <div class="card-title">Contacto</div>
          <div class="card-body">
            <div class="field">
              <label>Número de WhatsApp (con indicativo de país, solo números)</label>
              <input type="text" [(ngModel)]="whatsappNumber" placeholder="573001234567" />
            </div>
            <div class="field-row">
              <div class="field">
                <label>Correo de contacto (opcional)</label>
                <input type="email" [(ngModel)]="contactEmail" placeholder="contacto@tutienda.com" />
              </div>
              <div class="field">
                <label>Dirección (opcional)</label>
                <input type="text" [(ngModel)]="contactAddress" placeholder="Ciudad, dirección" />
              </div>
            </div>
          </div>
        </section>

        <!-- MENSAJE DE COMPRA -->
        <section class="card">
          <div class="card-title">Mensaje de compra</div>
          <div class="card-body">
            <div class="field">
              <label>Nota que ve el cliente junto al botón de WhatsApp</label>
              <textarea rows="2" [(ngModel)]="purchaseNote" placeholder="Te atendemos directo por WhatsApp para confirmar disponibilidad, pago y envío."></textarea>
            </div>
          </div>
        </section>
      </div>

      @if (message()) {
        <div class="message" [class.error]="isError()">{{ message() }}</div>
      }

      <button class="btn-dark dc-sheen" type="button" [disabled]="saving()" (click)="save()">
        {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
      </button>
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
      .sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr));
        gap: 24px;
        margin-bottom: 24px;
        align-items: start;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .card-title {
        font-size: 15px;
        font-weight: 700;
      }
      .card-body {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }
      .field-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }
      .field-row .field {
        min-width: 200px;
      }
      label {
        font-size: 13px;
        font-weight: 700;
      }
      input,
      textarea,
      select {
        padding: 13px 16px;
        border: 1px solid var(--border);
        border-radius: 12px;
        font-size: 15px;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      textarea {
        resize: vertical;
        font-family: inherit;
      }
      input:focus,
      textarea:focus,
      select:focus {
        border-color: var(--accent);
      }
      .color-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      input[type='color'] {
        width: 48px;
        height: 44px;
        padding: 4px;
        flex-shrink: 0;
      }
      .color-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--ink-soft);
      }
      .logo-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .logo-preview {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background: var(--surface-alt);
        color: var(--ink-faint);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }
      .logo-preview img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .btn-ghost {
        padding: 10px 18px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid var(--border);
        background: var(--surface);
      }
      .btn-ghost:hover {
        background: var(--surface-alt);
      }
      .btn-text {
        font-size: 13px;
        font-weight: 700;
        color: var(--danger);
      }
      .hint {
        font-size: 12px;
        color: var(--ink-faint);
      }
      .message {
        max-width: 640px;
        font-size: 13px;
        padding: 10px 14px;
        border-radius: 10px;
        background: var(--success-bg);
        color: var(--success-ink);
        margin-bottom: 16px;
      }
      .message.error {
        background: #fdecea;
        color: var(--danger);
      }
      .btn-dark {
        padding: 14px 30px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        background: var(--ink);
        color: #fff;
      }
      .btn-dark:disabled {
        opacity: 0.6;
      }
      .empty {
        color: var(--ink-faint);
      }
    `,
  ],
})
export class AdminSettingsComponent {
  private api = inject(ApiService);

  fontOptions = FONT_OPTIONS;

  loading = signal(true);
  saving = signal(false);
  uploadingLogo = signal(false);
  message = signal<string | null>(null);
  isError = signal(false);

  name = '';
  tagline = '';
  heroSubtitle = '';
  heroCtaLabel = '';
  whatsappNumber = '';
  contactEmail = '';
  contactAddress = '';
  purchaseNote = '';
  accentColor = '#4F46E5';
  fontKey = 'sora-jakarta';
  logoUrl = signal<string | null>(null);
  featuredProductId = signal<string | null>(null);
  products = signal<ProductSummary[]>([]);

  constructor() {
    this.api.getAdminStore().subscribe((s) => {
      this.name = s.name;
      this.tagline = s.tagline;
      this.heroSubtitle = s.heroSubtitle;
      this.heroCtaLabel = s.heroCtaLabel;
      this.whatsappNumber = s.whatsappNumber;
      this.contactEmail = s.contactEmail ?? '';
      this.contactAddress = s.contactAddress ?? '';
      this.purchaseNote = s.purchaseNote;
      this.accentColor = s.accentColor;
      this.fontKey = s.fontKey;
      this.logoUrl.set(s.logoUrl);
      this.featuredProductId.set(s.featuredProductId);
      this.loading.set(false);
    });
    this.api.getAdminProducts().subscribe((products) => this.products.set(products));
  }

  resolveUrl(url: string): string {
    return this.api.resolveAssetUrl(url);
  }

  onLogoSelected(files: FileList | null): void {
    const file = files?.[0];
    if (!file) return;
    this.uploadingLogo.set(true);
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.logoUrl.set(res.url);
        this.uploadingLogo.set(false);
      },
      error: (err) => {
        this.uploadingLogo.set(false);
        this.isError.set(true);
        this.message.set(err?.error?.error ?? 'No se pudo subir el logo.');
      },
    });
  }

  save(): void {
    this.saving.set(true);
    this.message.set(null);
    this.api
      .updateAdminStore({
        name: this.name,
        tagline: this.tagline,
        heroSubtitle: this.heroSubtitle,
        heroCtaLabel: this.heroCtaLabel,
        whatsappNumber: this.whatsappNumber,
        contactEmail: this.contactEmail || null,
        contactAddress: this.contactAddress || null,
        purchaseNote: this.purchaseNote,
        accentColor: this.accentColor,
        fontKey: this.fontKey,
        logoUrl: this.logoUrl(),
        featuredProductId: this.featuredProductId(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.isError.set(false);
          this.message.set('Cambios guardados correctamente.');
        },
        error: (err) => {
          this.saving.set(false);
          this.isError.set(true);
          this.message.set(err?.error?.error ?? 'No se pudieron guardar los cambios.');
        },
      });
  }
}

import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Category, ProductFeature } from '../../core/models';

@Component({
  selector: 'app-admin-product-form',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="crumb">
      <a [routerLink]="['/', tenant, 'admin', 'productos']">Productos</a>
      <span>/</span>
      <span class="current">{{ isEdit() ? 'Editar producto' : 'Nuevo producto' }}</span>
    </div>

    <h1>{{ isEdit() ? 'Editar producto' : 'Nuevo producto' }}</h1>

    @if (loading()) {
      <div class="empty">Cargando...</div>
    } @else {
      <div class="layout">
        <!-- IMAGES -->
        <div class="panel images-panel">
          <div class="panel-title">Fotos del producto</div>

          <input
            #fileInput
            type="file"
            accept="image/*"
            multiple
            hidden
            (change)="onFilesSelected($any($event.target).files); $any($event.target).value = ''"
          />

          <button class="upload-box" type="button" (click)="fileInput.click()">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <div class="upload-title">{{ uploading() ? 'Subiendo...' : 'Arrastra fotos aquí' }}</div>
            <div class="upload-sub">o haz clic para subir · JPG, PNG</div>
          </button>

          @if (images().length) {
            <div class="thumbs-grid">
              @for (img of images(); track img) {
                <div class="thumb">
                  <img [src]="resolveUrl(img)" alt="" />
                  <button class="remove" type="button" (click)="removeImage(img)">×</button>
                </div>
              }
            </div>
          }

          <div class="status-block">
            <div class="panel-title">Estado del producto</div>
            <div class="status-toggle">
              <button
                type="button"
                class="status-opt"
                [class.active]="status() === 'active'"
                (click)="status.set('active')"
              >
                Activo
              </button>
              <button
                type="button"
                class="status-opt"
                [class.active]="status() === 'sold_out'"
                (click)="status.set('sold_out')"
              >
                Agotado
              </button>
            </div>
          </div>
        </div>

        <!-- FIELDS -->
        <div class="panel fields-panel">
          <div class="field">
            <label>Nombre del producto</label>
            <input type="text" [(ngModel)]="name" placeholder="Ej: iPhone 13, Zapatilla Runner..." />
          </div>

          <div class="field-row">
            <div class="field">
              <label>Categoría</label>
              <select #categoryModel="ngModel" [ngModel]="categoryId" (ngModelChange)="onCategoryChange($event, categoryModel)">
                <option [ngValue]="null">Sin categoría</option>
                @for (c of categories(); track c.id) {
                  <option [ngValue]="c.id">{{ c.name }}</option>
                }
                <option value="__new__">+ Crear categoría nueva...</option>
              </select>
            </div>
            <div class="field">
              <label>Precio (COP)</label>
              <input type="number" min="0" [(ngModel)]="price" placeholder="0" />
            </div>
          </div>

          <div class="field">
            <label>Descripción</label>
            <textarea rows="3" [(ngModel)]="description" placeholder="Describe el producto..."></textarea>
          </div>

          <div class="field">
            <label>Variantes disponibles</label>
            <div class="tag-row">
              @for (v of variants(); track v) {
                <div class="tag">
                  {{ v }}
                  <span class="tag-remove" (click)="removeVariant(v)">×</span>
                </div>
              }
              <input
                class="tag-input"
                type="text"
                placeholder="+ Agregar variante"
                [(ngModel)]="newVariant"
                (keydown.enter)="addVariant(); $event.preventDefault()"
                (blur)="addVariant()"
              />
            </div>
          </div>

          <div class="field features-field">
            <label>Características</label>
            @for (f of features(); track $index) {
              <div class="feature-row">
                <input type="text" placeholder="Ej: Pantalla" [(ngModel)]="f.label" name="label{{ $index }}" />
                <input type="text" placeholder="Ej: 6.1&quot; OLED" [(ngModel)]="f.value" name="value{{ $index }}" />
                <button type="button" class="icon-btn danger" (click)="removeFeature($index)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2m-1 0v14a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V6h6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            }
            <button type="button" class="add-feature" (click)="addFeature()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Agregar característica
            </button>
          </div>
        </div>
      </div>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <div class="footer-actions">
        <a class="btn-ghost" [routerLink]="['/', tenant, 'admin', 'productos']">Cancelar</a>
        <button class="btn-dark dc-sheen" type="button" [disabled]="saving()" (click)="save()">
          {{ saving() ? 'Guardando...' : 'Guardar producto' }}
        </button>
      </div>
    }
  `,
  styles: [
    `
      .crumb {
        display: flex;
        gap: 8px;
        font-size: 14px;
        color: var(--ink-faint);
        margin-bottom: 12px;
      }
      .current {
        color: var(--ink);
        font-weight: 600;
      }
      h1 {
        font-size: 26px;
        font-weight: 800;
        margin-bottom: 24px;
      }
      .layout {
        display: flex;
        gap: 32px;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 24px;
      }
      .images-panel {
        width: 380px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex-shrink: 0;
      }
      .fields-panel {
        flex: 1;
        min-width: 320px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .panel-title {
        font-size: 14px;
        font-weight: 700;
      }
      .upload-box {
        width: 100%;
        height: 180px;
        border-radius: 16px;
        border: 2px dashed #d8d6cf;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--ink-faint);
        transition:
          border-color 0.15s ease,
          background 0.15s ease;
      }
      .upload-box:hover {
        border-color: var(--accent);
        background: var(--accent-soft);
      }
      .upload-title {
        font-size: 13px;
        font-weight: 600;
      }
      .upload-sub {
        font-size: 12px;
      }
      .thumbs-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      .thumb {
        position: relative;
        aspect-ratio: 1;
        border-radius: 10px;
        overflow: hidden;
        background: var(--surface-alt);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb .remove {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 20px;
        height: 20px;
        border-radius: 100px;
        background: var(--ink);
        color: #fff;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .status-block {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 8px;
        border-top: 1px solid var(--surface-alt);
      }
      .status-toggle {
        display: flex;
        gap: 10px;
      }
      .status-opt {
        flex: 1;
        text-align: center;
        padding: 11px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--ink);
      }
      .status-opt.active {
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }
      .field-row .field {
        flex: 1;
      }
      label {
        font-size: 13px;
        font-weight: 700;
      }
      input,
      select,
      textarea {
        padding: 13px 16px;
        border: 1px solid var(--border);
        border-radius: 12px;
        font-size: 15px;
        outline: none;
      }
      input:focus,
      select:focus,
      textarea:focus {
        border-color: var(--accent);
      }
      textarea {
        resize: vertical;
      }
      .tag-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }
      .tag {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 8px 8px 16px;
        border-radius: 100px;
        background: var(--surface-alt);
        font-size: 13px;
        font-weight: 600;
      }
      .tag-remove {
        width: 18px;
        height: 18px;
        border-radius: 100px;
        background: var(--ink);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        cursor: pointer;
      }
      .tag-input {
        border: 1px dashed var(--border);
        border-radius: 100px;
        padding: 9px 16px;
        font-size: 13px;
        width: 160px;
      }
      .features-field {
        padding-top: 8px;
        border-top: 1px solid var(--surface-alt);
        gap: 10px;
      }
      .feature-row {
        display: flex;
        gap: 10px;
      }
      .feature-row input:first-child {
        flex: 1;
      }
      .feature-row input:nth-child(2) {
        flex: 2;
      }
      .icon-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        flex-shrink: 0;
      }
      .icon-btn.danger {
        color: var(--danger);
      }
      .add-feature {
        align-self: flex-start;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid var(--border);
        background: var(--surface);
      }
      .add-feature:hover {
        background: var(--surface-alt);
      }
      .error {
        margin-top: 20px;
        background: #fdecea;
        color: var(--danger);
        font-size: 13px;
        padding: 12px 16px;
        border-radius: 10px;
      }
      .footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 28px;
      }
      .btn-ghost {
        padding: 14px 26px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        border: 1px solid var(--border);
        background: var(--surface);
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
        padding: 40px 0;
      }
    `,
  ],
})
export class AdminProductFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  tenant = this.route.snapshot.parent!.paramMap.get('tenant')!;
  productId = this.route.snapshot.paramMap.get('id');
  isEdit = signal(!!this.productId);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);

  categories = signal<Category[]>([]);

  name = '';
  price: number | null = null;
  description = '';
  categoryId: string | null = null;
  status = signal<'active' | 'sold_out'>('active');
  images = signal<string[]>([]);
  features = signal<ProductFeature[]>([]);
  variants = signal<string[]>([]);
  newVariant = '';

  constructor() {
    this.api.getAdminCategories().subscribe((c) => this.categories.set(c));

    if (this.productId) {
      this.api.getAdminProduct(this.productId).subscribe((p) => {
        this.name = p.name;
        this.price = p.price;
        this.description = p.description;
        this.categoryId = p.category_id;
        this.status.set(p.status);
        this.images.set(p.images);
        this.features.set(p.features.map((f) => ({ ...f })));
        this.variants.set(p.variants);
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  resolveUrl(url: string): string {
    return this.api.resolveAssetUrl(url);
  }

  onCategoryChange(value: string | null, model: NgModel): void {
    if (value !== '__new__') {
      this.categoryId = value;
      return;
    }
    // El <select> quedó mostrando "+ Crear…": vuelve a la categoría real hasta tener la nueva.
    const showCurrent = () => setTimeout(() => model.valueAccessor?.writeValue(this.categoryId));
    showCurrent();

    const name = window.prompt('Nombre de la nueva categoría:');
    if (!name || !name.trim()) return;
    this.api.createCategory(name.trim()).subscribe({
      next: (category) => {
        this.categories.update((cs) => [...cs, category].sort((a, b) => a.name.localeCompare(b.name)));
        this.categoryId = category.id;
        showCurrent();
      },
      error: (err) => this.error.set(err?.error?.error ?? 'No se pudo crear la categoría'),
    });
  }

  onFilesSelected(files: FileList | null): void {
    if (!files || !files.length) return;
    this.uploading.set(true);
    this.error.set(null);
    let remaining = files.length;
    const done = () => {
      remaining -= 1;
      if (remaining <= 0) this.uploading.set(false);
    };

    Array.from(files).forEach((file) => {
      this.api.uploadImage(file).subscribe({
        next: (res) => this.images.update((imgs) => [...imgs, res.url]),
        error: (err) => {
          this.error.set(err?.error?.error ?? `No se pudo subir "${file.name}"`);
          done();
        },
        complete: done,
      });
    });
  }

  removeImage(url: string): void {
    this.images.update((imgs) => imgs.filter((i) => i !== url));
  }

  addVariant(): void {
    const value = this.newVariant.trim();
    if (!value) return;
    if (!this.variants().includes(value)) {
      this.variants.update((vs) => [...vs, value]);
    }
    this.newVariant = '';
  }

  removeVariant(value: string): void {
    this.variants.update((vs) => vs.filter((v) => v !== value));
  }

  addFeature(): void {
    this.features.update((fs) => [...fs, { label: '', value: '' }]);
  }

  removeFeature(index: number): void {
    this.features.update((fs) => fs.filter((_, i) => i !== index));
  }

  save(): void {
    if (!this.name.trim()) {
      this.error.set('El nombre del producto es obligatorio');
      return;
    }
    if (this.price === null || this.price < 0) {
      this.error.set('El precio debe ser un número válido');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload = {
      name: this.name.trim(),
      price: this.price,
      description: this.description,
      categoryId: this.categoryId,
      status: this.status(),
      images: this.images(),
      features: this.features().filter((f) => f.label.trim() && f.value.trim()),
      variants: this.variants(),
    };

    const request = this.productId
      ? this.api.updateProduct(this.productId, payload)
      : this.api.createProduct(payload);

    request.subscribe({
      next: () => this.router.navigate(['/', this.tenant, 'admin', 'productos']),
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'No se pudo guardar el producto');
      },
    });
  }
}

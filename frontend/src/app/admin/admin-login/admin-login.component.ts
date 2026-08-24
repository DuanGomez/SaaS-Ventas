import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  template: `
    <div class="wrap">
      <div class="card">
        <div class="head">
          <div class="brand">{{ tenant }}<span class="dot">.</span></div>
          <h1>Panel de administración</h1>
          <div class="sub">Ingresa a la gestión de tu tienda</div>
        </div>

        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Correo electrónico</label>
            <input type="email" name="email" [(ngModel)]="email" required autocomplete="username" />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              autocomplete="current-password"
            />
          </div>

          @if (error()) {
            <div class="error">{{ error() }}</div>
          }

          <button class="submit" type="submit" [disabled]="loading()">
            {{ loading() ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="note">Acceso exclusivo para administradores de la tienda.</div>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        background: var(--ink);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        width: 100%;
        max-width: 420px;
        background: var(--surface);
        border-radius: 24px;
        padding: 44px 40px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.5);
      }
      .head {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
      }
      .brand {
        font-family: 'Sora', sans-serif;
        font-weight: 800;
        font-size: 20px;
        text-transform: capitalize;
      }
      .dot {
        color: var(--accent);
      }
      h1 {
        font-size: 21px;
        margin-top: 6px;
      }
      .sub {
        font-size: 14px;
        color: var(--ink-faint);
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      label {
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-soft);
      }
      input {
        padding: 13px 16px;
        border: 1px solid var(--border);
        border-radius: 12px;
        font-size: 15px;
        outline: none;
      }
      input:focus {
        border-color: var(--accent);
      }
      .error {
        background: #fdecea;
        color: var(--danger);
        font-size: 13px;
        padding: 10px 14px;
        border-radius: 10px;
      }
      .submit {
        background: var(--ink);
        color: #fff;
        padding: 15px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 700;
      }
      .submit:disabled {
        opacity: 0.6;
      }
      .note {
        font-size: 12px;
        color: var(--ink-faint);
        text-align: center;
        line-height: 1.6;
      }
    `,
  ],
})
export class AdminLoginComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  tenant = this.route.snapshot.paramMap.get('tenant')!;
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.api.login(this.tenant, this.email, this.password).subscribe({
      next: (res) => {
        this.auth.setToken(this.tenant, res.token);
        this.router.navigate(['/', this.tenant, 'admin', 'productos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'No se pudo iniciar sesión');
      },
    });
  }
}

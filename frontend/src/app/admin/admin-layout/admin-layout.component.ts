import { DcodeaBadgeComponent } from '../../core/dcodea-badge.component';
import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DcodeaBadgeComponent],
  template: `
    <div class="shell tenant-theme" [style.--accent]="accent()">
      <aside class="sidebar dc-dark">
        <div class="brand">{{ tenant }}<span class="dot">.</span> <span class="tag">admin</span></div>
        <nav>
          <a
            class="link"
            [routerLink]="['/', tenant, 'admin', 'panel']"
            routerLinkActive="active"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8" />
              <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8" />
              <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8" />
              <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8" />
            </svg>
            Panel general
          </a>
          <a
            class="link"
            [routerLink]="['/', tenant, 'admin', 'productos']"
            routerLinkActive="active"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l9-5 9 5-9 5-9-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
            </svg>
            Productos
          </a>
          <a
            class="link"
            [routerLink]="['/', tenant, 'admin', 'configuracion']"
            routerLinkActive="active"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"
                stroke="currentColor"
                stroke-width="1.6"
              />
            </svg>
            Configuración
          </a>
        </nav>
        <app-dcodea-badge class="badge" />
        <button class="link logout" (click)="logout()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Cerrar sesión
        </button>
      </aside>

      <div class="main">
        <div class="topbar">
          <div class="store-label">
            Tienda: <strong>{{ storeName() ?? tenant }}</strong>
          </div>
          <a class="view-store" [routerLink]="['/', tenant]" target="_blank">
            Ver tienda
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
        <div class="content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        display: flex;
        background: var(--bg);
      }
      .sidebar {
        width: 260px;
        display: flex;
        flex-direction: column;
        padding: 28px 20px;
        gap: 32px;
        flex-shrink: 0;
      }
      .brand {
        font-family: 'Sora', sans-serif;
        font-weight: 800;
        font-size: 20px;
        color: #fff;
        padding: 0 8px;
        text-transform: capitalize;
      }
      .dot {
        color: var(--accent);
      }
      .tag {
        font-size: 12px;
        font-weight: 500;
        color: #8b8b91;
        text-transform: none;
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #a2a2a8;
        transition:
          color 0.15s ease,
          background 0.15s ease;
      }
      .link:hover {
        color: #fff;
        background: #222226;
      }
      .link.active {
        color: #fff;
        background: var(--accent);
      }
      .badge {
        margin-top: auto;
      }
      .logout {
        text-align: left;
        width: 100%;
      }
      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .topbar {
        height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
      }
      .store-label {
        font-size: 14px;
        color: var(--ink-faint);
      }
      .view-store {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--accent);
      }
      .content {
        padding: 36px 40px 60px;
      }
      @media (max-width: 860px) {
        .shell {
          flex-direction: column;
        }
        .sidebar {
          width: 100%;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
        }
        .brand {
          padding: 0;
          flex: 1;
        }
        nav {
          order: 3;
          width: 100%;
          flex-direction: row;
          overflow-x: auto;
        }
        .link {
          white-space: nowrap;
          padding: 9px 12px;
        }
        .badge {
          display: none;
        }
        .logout {
          margin: 0;
          width: auto;
        }
        .topbar {
          height: auto;
          padding: 12px 16px;
          gap: 12px;
        }
        .content {
          padding: 24px 16px 48px;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private titleService = inject(Title);

  tenant = this.route.snapshot.paramMap.get('tenant')!;
  storeName = signal<string | null>(null);
  accent = signal<string | null>(null);

  constructor() {
    this.api.getAdminStore().subscribe((s) => {
      this.storeName.set(s.name);
      this.accent.set(s.accentColor);
      this.titleService.setTitle(`Administración · ${s.name}`);
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/', this.tenant, 'admin', 'login']);
  }
}

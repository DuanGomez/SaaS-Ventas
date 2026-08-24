import { Injectable, computed, signal } from '@angular/core';

function storageKey(tenant: string): string {
  return `saas-ventas:token:${tenant}`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tenantSlug = signal<string | null>(null);
  private tokenSig = signal<string | null>(null);

  readonly token = computed(() => this.tokenSig());
  readonly isAuthenticated = computed(() => !!this.tokenSig());
  readonly tenant = computed(() => this.tenantSlug());

  /** Loads whatever token is stored for this tenant, so guards/services see it immediately. */
  setTenant(tenant: string): void {
    if (this.tenantSlug() === tenant) return;
    this.tenantSlug.set(tenant);
    this.tokenSig.set(localStorage.getItem(storageKey(tenant)));
  }

  setToken(tenant: string, token: string): void {
    localStorage.setItem(storageKey(tenant), token);
    this.tenantSlug.set(tenant);
    this.tokenSig.set(token);
  }

  logout(): void {
    const tenant = this.tenantSlug();
    if (tenant) localStorage.removeItem(storageKey(tenant));
    this.tokenSig.set(null);
  }
}

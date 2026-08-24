import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: ':tenant/admin/login',
    loadComponent: () =>
      import('./admin/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: ':tenant/admin',
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      {
        path: 'panel',
        loadComponent: () =>
          import('./admin/admin-overview/admin-overview.component').then(
            (m) => m.AdminOverviewComponent
          ),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./admin/admin-product-form/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./admin/admin-settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent
          ),
      },
    ],
  },
  {
    path: ':tenant/producto/:id',
    loadComponent: () =>
      import('./store/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
  },
  {
    path: ':tenant',
    loadComponent: () =>
      import('./store/store-home/store-home.component').then((m) => m.StoreHomeComponent),
  },
];

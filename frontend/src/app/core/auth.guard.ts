import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tenant = route.paramMap.get('tenant')!;

  auth.setTenant(tenant);

  if (auth.isAuthenticated()) return true;

  return router.parseUrl(`/${tenant}/admin/login`);
};

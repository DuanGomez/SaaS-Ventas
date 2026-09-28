import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Si el token del panel admin venció o es inválido, cierra la sesión y vuelve al login. */
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      const tenant = auth.tenant();
      if (err instanceof HttpErrorResponse && err.status === 401 && req.url.includes('/admin/') && tenant) {
        auth.logout();
        router.navigate(['/', tenant, 'admin', 'login']);
        // Ya se redirigió al login: la vista que hizo la petición se destruye, no hay nada que manejar.
        return EMPTY;
      }
      return throwError(() => err);
    })
  );
};

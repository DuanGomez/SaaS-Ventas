import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { sessionExpiredInterceptor } from './core/session-expired.interceptor';
import { demoBackendInterceptor } from './core/demo/demo-backend.interceptor';

// En modo demo (GitHub Pages) el último interceptor responde en lugar del servidor.
const interceptors: HttpInterceptorFn[] = [sessionExpiredInterceptor];
if (environment.demo) interceptors.push(demoBackendInterceptor);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors(interceptors)),
  ]
};

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/services/auth/auth.service';
import { credentialsInterceptor } from './core/interceptors/credentialsInterceptor';
import { loadingInterceptor } from './core/interceptors/loadingInterceptor';
import { authRefreshInterceptor } from './core/interceptors/authRefreshInterceptor';
import { apiErrorInterceptor } from './core/interceptors/apiErrorInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor, loadingInterceptor, authRefreshInterceptor, apiErrorInterceptor])),


    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.loadCurrentUser();
    }),
  ],
};

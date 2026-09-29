import { Routes } from '@angular/router';

export const PLATFORM_ROUTES: Routes = [
  {
    path: 'registration',
    loadChildren: () =>
      import('./registration/registration.routes').then(
        (m) => m.REGISTRATION_ROUTES,
      ),
  },
];
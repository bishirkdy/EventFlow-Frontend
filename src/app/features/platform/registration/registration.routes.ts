import { Routes } from '@angular/router';

export const REGISTRATION_ROUTES: Routes = [
  {
    path: 'events/:eventId/register',
    loadComponent: () =>
      import('./pages/public/register/register').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'events/:eventId/my-registrations',
    loadComponent: () =>
      import('./pages/public/my-registrations/my-registrations').then(
        (m) => m.MyRegistrationsComponent,
      ),
  },
  {
    path: 'events/:eventId/registrations/:registrationId',
    loadComponent: () =>
      import('./pages/public/registration-details/registration-details').then(
        (m) => m.PublicRegistrationDetailsComponent,
      ),
  },
];

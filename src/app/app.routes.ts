import { Routes } from '@angular/router';
import { PublicLayout } from './shared/layouts/public-layout/public-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/platform/home/home').then((m) => m.Home),
      },
      {
        path: 'create-event',
        loadComponent: () =>
          import('./features/platform/create-event/create-event')
            .then(m => m.CreateEvent),
      },
      {
        path: 'my-events',
        loadComponent: () =>
          import('./features/platform/my-events/my-events')
            .then(m => m.MyEvents),
      },
    ],
  },
  {
    path: 'events/:eventId',
    loadChildren: () =>
      import('./features/organizer/organizer.routes').then(
        (m) => m.organizerRoutes
      ),
  },
  {
    path: '**',
    redirectTo: '',
  }
];

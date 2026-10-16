import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'events',
        loadComponent: () => import('./pages/events/events').then((m) => m.AdminEvents),
      },
      {
        path: 'events/:eventId',
        loadComponent: () =>
          import('./pages/event-detail/event-detail').then((m) => m.AdminEventDetail),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then((m) => m.AdminUsers),
      },
    ],
  },
];

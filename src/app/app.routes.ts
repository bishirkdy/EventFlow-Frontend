import { Routes } from '@angular/router';
import { PublicLayout } from './shared/layouts/public-layout/public-layout';
import { authGuard } from './core/guards/auth/auth-guard';
import { eventRoleGuard } from './core/guards/event-role/event-role.guard';
import { REGISTRATION_ROUTES } from './features/platform/registration/registration.routes';

export const routes: Routes = [
  ...REGISTRATION_ROUTES,
  {
    path: 'photographer/invite/:token',
    loadComponent: () => import('./features/photographer/invitation/accept-invitation/accept-invitation').then((m) => m.AcceptInvitation),
  },
  {
    path: 'photographer',
    canActivate: [authGuard],
    loadChildren: () => import('./features/photographer/dashboard/photographer-dashboard.routes').then((m) => m.photographerRoutes),
  },
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
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/platform/create-event/create-event').then((m) => m.CreateEvent),
      },
      {
        path: 'my-events',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/platform/my-events/my-events').then((m) => m.MyEvents),
      },
    ],
  },
  {
    path: 'events/:eventId/attendance',
    canActivate: [authGuard],
    loadComponent: () => import('./features/platform/attendance-history/attendance-history').then(m => m.AttendanceHistoryComponent),
  },
  {
    path: 'events/:eventId/:slug',
    loadComponent: () => import('./features/website/website').then((m) => m.Website),
  },
  {
    path: 'events/:eventId',
    loadComponent: () => import('./features/website/website').then((m) => m.Website),
  },
  {
    path: 'organizer',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/organizer/organizer.routes').then((m) => m.organizerRoutes),
  },
  {
    path: 'owner/:eventId',
    canActivate: [authGuard, eventRoleGuard('Owner')],
    loadComponent: () =>
      import('./features/owner/pages/owner-dashboard/owner-dashboard').then(
        (m) => m.OwnerDashboard,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

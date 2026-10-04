import { Routes } from '@angular/router';
import { PublicLayout } from './shared/layouts/public-layout/public-layout';
import { authGuard } from './core/guards/auth/auth-guard';
import { eventRoleGuard } from './core/guards/event-role/event-role.guard';
import { REGISTRATION_ROUTES } from './features/platform/registration/registration.routes';
import { AttendanceStaffLayout } from './features/attendance-staff/layout/attendance-staff-layout';

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
    path: 'events/:eventId/gallery',
    loadComponent: () => import('./features/platform/photos/photo-gallery/photo-gallery').then((m) => m.PhotoGallery),
  },
  {
    path: 'events/:eventId/gallery/my',
    loadComponent: () => import('./features/platform/photos/face-detection/my-photos/my-photos').then((m) => m.MyPhotos),
  },
  {
    path: 'events/:eventId/gallery/selfie',
    loadComponent: () => import('./features/platform/photos/face-detection/selfie-capture/selfie-capture').then((m) => m.SelfieCapture),
  },
  {
    path: 'events/:eventId/certificates',
    canActivate: [authGuard],
    loadComponent: () => import('./features/platform/certificates/my-certificate/my-certificate').then((m) => m.MyCertificate),
  },
  {
    path: 'verify/certificate/:certificateNumber',
    loadComponent: () => import('./features/platform/certificates/certificate-verify/certificate-verify').then((m) => m.CertificateVerify),
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
    path: 'attendance-staff/:eventId',
    canActivate: [authGuard, eventRoleGuard('AttendanceStaff')],
    component: AttendanceStaffLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/attendance-staff/pages/dashboard/dashboard').then((m) => m.AttendanceStaffDashboard),
      },
      {
        path: 'scan',
        loadComponent: () => import('./features/attendance-staff/pages/scanner/scanner').then((m) => m.AttendanceQrScanner),
      },
    ],
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

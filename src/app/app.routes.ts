import { Routes } from '@angular/router';
import { PublicLayout } from './shared/layouts/public-layout/public-layout';
import { authGuard } from './core/guards/auth/auth-guard';
import { publicEventFeatureGuard } from './core/guards/feature/feature.guard';
import { eventRoleGuard } from './core/guards/event-role/event-role.guard';
import { platformAdminGuard } from './core/guards/platform-admin/platform-admin.guard';
import { REGISTRATION_ROUTES } from './features/platform/registration/registration.routes';
import { AttendanceStaffLayout } from './features/attendance-staff/layout/attendance-staff-layout';

export const routes: Routes = [
  ...REGISTRATION_ROUTES,
  {
    path: 'photographer-invitation/:token',
    loadComponent: () =>
      import('./features/photographer/invitation/accept-invitation/accept-invitation').then(
        (m) => m.AcceptInvitation,
      ),
  },
  {
    path: 'organizer-invitation/:token',
    loadComponent: () =>
      import('./features/photographer/invitation/accept-invitation/accept-invitation').then(
        (m) => m.AcceptInvitation,
      ),
  },
  {
    path: 'attendance-staff-invitation/:token',
    loadComponent: () =>
      import('./features/photographer/invitation/accept-invitation/accept-invitation').then(
        (m) => m.AcceptInvitation,
      ),
  },
  {
    path: 'photographer',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/photographer/dashboard/photographer-dashboard.routes').then(
        (m) => m.photographerRoutes,
      ),
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
        path: 'about',
        loadComponent: () => import('./features/platform/about/about').then((m) => m.About),
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/platform/contact/contact').then((m) => m.Contact),
      },
      {
        path: 'events',
        loadComponent: () => import('./features/platform/events/events').then((m) => m.Events),
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
      {
        path: 'my-certificates',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/platform/certificates/my-certificates/my-certificates').then(
            (m) => m.MyCertificates,
          ),
      },
    ],
  },
  {
    path: 'events/:eventId/attendance',
    canActivate: [authGuard, publicEventFeatureGuard('attendance')],
    loadComponent: () =>
      import('./features/platform/attendance-history/attendance-history').then(
        (m) => m.AttendanceHistoryComponent,
      ),
  },
  {
    path: 'events/:eventId/gallery',
    canActivate: [publicEventFeatureGuard('gallery')],
    loadComponent: () =>
      import('./features/platform/photos/photo-gallery/photo-gallery').then((m) => m.PhotoGallery),
  },
  {
    path: 'events/:eventId/gallery/my',
    canActivate: [publicEventFeatureGuard('gallery')],
    loadComponent: () =>
      import('./features/platform/photos/face-detection/my-photos/my-photos').then(
        (m) => m.MyPhotos,
      ),
  },
  {
    path: 'events/:eventId/gallery/selfie',
    canActivate: [publicEventFeatureGuard('gallery')],
    loadComponent: () =>
      import('./features/platform/photos/face-detection/selfie-capture/selfie-capture').then(
        (m) => m.SelfieCapture,
      ),
  },
  {
    path: 'events/:eventId/certificates',
    canActivate: [authGuard, publicEventFeatureGuard('certificates')],
    loadComponent: () =>
      import('./features/platform/certificates/my-certificate/my-certificate').then(
        (m) => m.MyCertificate,
      ),
  },
  {
    path: 'events/:eventId/feedback',
    canActivate: [authGuard, publicEventFeatureGuard('feedback')],
    loadComponent: () =>
      import('./features/platform/feedback/feedback').then((m) => m.FeedbackComponent),
  },
  {
    path: 'verify/certificate/:certificateNumber',
    loadComponent: () =>
      import('./features/platform/certificates/certificate-verify/certificate-verify').then(
        (m) => m.CertificateVerify,
      ),
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
        loadComponent: () =>
          import('./features/attendance-staff/pages/dashboard/dashboard').then(
            (m) => m.AttendanceStaffDashboard,
          ),
      },
      {
        path: 'scan',
        loadComponent: () =>
          import('./features/attendance-staff/pages/scanner/scanner').then(
            (m) => m.AttendanceQrScanner,
          ),
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
    path: 'admin',
    canActivate: [authGuard, platformAdminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
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

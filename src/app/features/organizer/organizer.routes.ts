import { eventFeatureGuard } from '../../core/guards/feature/feature.guard';
import { eventRoleGuard } from '../../core/guards/event-role/event-role.guard';
import { Routes } from '@angular/router';
import { OrganizerLayout } from './layout/organizer-layout/organizer-layout';
import { Overview } from './pages/overview/overview';

export const organizerRoutes: Routes = [
  {
    path: ':eventId',
    canActivate: [eventRoleGuard('Organizer')],
    component: OrganizerLayout,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        component: Overview,
      },
      // Event
      {
        path: 'event',
        children: [
          {
            path: 'details',
            loadComponent: () =>
              import('./pages/event-details/event-details').then((m) => m.EventDetails),
          },
        ],
      },

      // Event settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/event-settings/event-settings').then((m) => m.EventSettings),
      },
      // Photographer Management
      {
        path: 'settings/photographers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/settings/photographers/photographer-management').then(
                (m) => m.PhotographerManagement,
              ),
          },
          {
            path: 'photos',
            loadComponent: () =>
              import('./pages/settings/photographers/photo-moderation/photo-moderation-grid').then(
                (m) => m.PhotoModerationGrid,
              ),
          },
        ],
      },
      // Certificates
      {
        path: 'settings/certificates',
        loadComponent: () =>
          import('./pages/settings/certificates/certificate-settings').then(
            (m) => m.CertificateSettings,
          ),
      },
      // Website preview
      {
        path: 'preview',
        loadComponent: () => import('./pages/preview/preview').then((m) => m.Preview),
      },

      // Event Features
      {
        path: 'features',
        loadComponent: () => import('./pages/features/features').then((m) => m.Features),
      },

      // Sections
      {
        path: 'sections',
        canActivate: [eventFeatureGuard('sessions')],
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/sections/sections').then((m) => m.Sections),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/sections/create-section/create-section').then((m) => m.CreateSection),
          },
          {
            path: ':sectionId',
            loadComponent: () =>
              import('./pages/sections/section-details/section-details').then(
                (m) => m.SectionDetails,
              ),
          },
          {
            path: ':sectionId/edit',
            loadComponent: () =>
              import('./pages/sections/update-section/update-section').then((m) => m.UpdateSection),
          },
        ],
      },

      // Venues
      {
        path: 'venues',
        canActivate: [eventFeatureGuard('venues')],
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/venues/venues').then((m) => m.Venues),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/venues/create-venue/create-venue').then((m) => m.CreateVenue),
          },
          {
            path: ':venueId',
            loadComponent: () =>
              import('./pages/venues/venue-details/venue-details').then((m) => m.VenueDetails),
          },
          {
            path: ':venueId/edit',
            loadComponent: () =>
              import('./pages/venues/edit-venue/edit-venue').then((m) => m.EditVenue),
          },
        ],
      },

      // Speakers
      {
        path: 'speakers',
        canActivate: [eventFeatureGuard('speakers')],
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/speakers/speakers').then((m) => m.Speakers),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/speakers/create-speaker/create-speaker').then((m) => m.CreateSpeaker),
          },
          {
            path: ':speakerId/edit',
            loadComponent: () =>
              import('./pages/speakers/edit-speaker/edit-speaker').then((m) => m.EditSpeaker),
          },
          {
            path: ':speakerId',
            loadComponent: () =>
              import('./pages/speakers/speaker-details/speaker-details').then(
                (m) => m.SpeakerDetails,
              ),
          },
        ],
      },

      // Sponsors
      {
        path: 'sponsors',
        canActivate: [eventFeatureGuard('sponsors')],
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/sponsors/sponsors').then((m) => m.Sponsors),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/sponsors/create-sponsor/create-sponsor').then((m) => m.CreateSponsor),
          },
          {
            path: ':sponsorId/edit',
            loadComponent: () =>
              import('./pages/sponsors/edit-sponsor/edit-sponsor').then((m) => m.EditSponsor),
          },
          {
            path: ':sponsorId',
            loadComponent: () =>
              import('./pages/sponsors/sponsor-details/sponsor-details').then(
                (m) => m.SponsorDetails,
              ),
          },
        ],
      },

      // Sessions
      {
        path: 'sessions',
        canActivate: [eventFeatureGuard('sessions')],
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/sessions/sessions').then((m) => m.Sessions),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/sessions/create-session/create-session').then((m) => m.CreateSession),
          },
          {
            path: ':sessionId/edit',
            loadComponent: () =>
              import('./pages/sessions/update-session/update-session').then((m) => m.UpdateSession),
          },
          {
            path: ':sessionId',
            loadComponent: () =>
              import('./pages/sessions/session-details/session-details').then(
                (m) => m.SessionDetails,
              ),
          },
        ],
      },

      // Event Pages
      {
        path: 'pages',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/pages/pages').then((m) => m.Pages),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/pages/create-page/create-page').then((m) => m.CreatePage),
          },
          {
            path: ':pageId/edit',
            loadComponent: () =>
              import('./pages/pages/edit-page/edit-page').then((m) => m.EditPage),
          },
          {
            path: ':pageId',
            loadComponent: () =>
              import('./pages/pages/page-details/page-details').then((m) => m.PageDetails),
          },
          //page sections
          {
            path: ':pageId/sections',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/page-sections/page-sections').then((m) => m.PageSections),
              },
              {
                path: 'create',
                loadComponent: () =>
                  import('./pages/page-sections/create-page-section/create-page-section').then(
                    (m) => m.CreatePageSection,
                  ),
              },
              {
                path: ':sectionId/edit',
                loadComponent: () =>
                  import('./pages/page-sections/edit-page-section/edit-page-section').then(
                    (m) => m.EditPageSection,
                  ),
              },
            ],
          },
        ],
      },

      // Navigation items
      {
        path: 'navigation',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/navigation/navigation').then((m) => m.Navigation),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/navigation/create-navigation-item/create-navigation-item').then(
                (m) => m.CreateNavigationItem,
              ),
          },
          {
            path: ':itemId/edit',
            loadComponent: () =>
              import('./pages/navigation/edit-navigation-item/edit-navigation-item').then(
                (m) => m.EditNavigationItem,
              ),
          },
        ],
      },

      // Attendance operations
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/attendance/attendance').then((m) => m.AttendanceComponent),
      },
      {
        path: 'attendance-staff',
        loadComponent: () =>
          import('./pages/attendance-staff/attendance-staff').then(
            (m) => m.AttendanceStaffComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications').then((m) => m.NotificationsComponent),
      },
      {
        path: 'feedback',
        canActivate: [eventFeatureGuard('feedback')],
        loadComponent: () =>
          import('./pages/feedback/feedback').then((m) => m.OrganizerFeedbackComponent),
      },

      //Registration
      {
        path: 'registration',
        canActivate: [eventFeatureGuard('registration')],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'registrations',
          },
          {
            path: 'form',
            loadComponent: () =>
              import('./pages/registration/registration-form/registration-form').then(
                (m) => m.RegistrationFormPageComponent,
              ),
          },
          {
            path: 'registrations',
            loadComponent: () =>
              import('./pages/registration/registrations/registrations').then(
                (m) => m.RegistrationsComponent,
              ),
          },
          {
            path: 'registrations/:registrationId',
            loadComponent: () =>
              import('./pages/registration/registration-details/registration-details').then(
                (m) => m.RegistrationDetailsComponent,
              ),
          },
          {
            path: 'participants',
            loadComponent: () =>
              import('./pages/registration/participants/participants').then(
                (m) => m.ParticipantsComponent,
              ),
          },
        ],
      },
    ],
  },
];

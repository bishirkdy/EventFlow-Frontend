import { Routes } from '@angular/router';
import { OrganizerLayout } from './layout/organizer-layout/organizer-layout';
import { Overview } from './pages/overview/overview';

export const organizerRoutes: Routes = [
  {
    path: ':eventId',
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

      // Event Settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/event-settings/event-settings').then((m) => m.EventSettings),
      },

      // Sections
      {
        path: 'sections',
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

      // Sessions
      {
        path: 'sessions',
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

      //     // Features
      //     {
      //         path: 'features',
      //         loadComponent: () =>
      //             import('./pages/features/features')
      //                 .then(m => m.Features),
      //     },

      //     // Event Pages
      //     {
      //         path: 'pages',
      //         children: [
      //             {
      //                 path: '',
      //                 loadComponent: () =>
      //                     import('./pages/pages/pages')
      //                         .then(m => m.Pages),
      //             },
      //             {
      //                 path: 'create',
      //                 loadComponent: () =>
      //                     import('./pages/pages/create-page/create-page')
      //                         .then(m => m.CreatePage),
      //             },
      //             {
      //                 path: ':pageId',
      //                 loadComponent: () =>
      //                     import('./pages/pages/page-details/page-details')
      //                         .then(m => m.PageDetails),
      //             },
      //         ],
      //     },

      //     // Navigation
      //     {
      //         path: 'navigation',
      //         children: [
      //             {
      //                 path: '',
      //                 loadComponent: () =>
      //                     import('./pages/navigation/navigation')
      //                         .then(m => m.Navigation),
      //             },
      //             {
      //                 path: ':menuId/items',
      //                 loadComponent: () =>
      //                     import('./pages/navigation/navigation-items/navigation-items')
      //                         .then(m => m.NavigationItems),
      //             },
      //         ],
      //     },
    ],
  },
];

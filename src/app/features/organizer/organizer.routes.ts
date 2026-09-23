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
      // Event Features
{
  path: 'features',
  loadComponent: () =>
    import('./pages/features/features').then(
      (m) => m.Features,
    ),
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

      // Navigations
      {
        path: 'navigation-menus',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/navigation-menus/navigation-menus').then((m) => m.NavigationMenus),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./pages/navigation-menus/create-navigation-menu/create-navigation-menu').then(
                (m) => m.CreateNavigationMenu,
              ),
          },
          {
            path: ':menuId/edit',
            loadComponent: () =>
              import('./pages/navigation-menus/edit-navigation-menu/edit-navigation-menu').then(
                (m) => m.EditNavigationMenu,
              ),
          },
          {
            path: ':menuId',
            loadComponent: () =>
              import('./pages/navigation-menus/navigation-menu-details/navigation-menu-details').then(
                (m) => m.NavigationMenuDetails,
              ),
          },

          // Navigation Items
          {
            path: ':menuId/items',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/navigation-menus/navigation-items/navigation-items').then(
                    (m) => m.NavigationItems,
                  ),
              },
              {
                path: 'create',
                loadComponent: () =>
                  import('./pages/navigation-menus/navigation-items/create-navigation-item/create-navigation-item').then(
                    (m) => m.CreateNavigationItem,
                  ),
              },
              {
                path: ':itemId/edit',
                loadComponent: () =>
                  import('./pages/navigation-menus/navigation-items/edit-navigation-item/edit-navigation-item').then(
                    (m) => m.EditNavigationItem,
                  ),
              },
            ],
          },
        ],
      },
      // Preview
      {
        path: 'preview',
        loadComponent: () => import('./pages/preview/preview').then((m) => m.Preview),
      },

    ],
  },
];

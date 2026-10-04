import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  // Authenticated / personal pages must render on the client: the server has no
  // session cookies, so guards and profile-backed data render the wrong page
  // (login flash, kicked-to-home) into the SSR HTML on hard reload.
  // These specific paths are declared before the generic events/:eventId/:slug
  // route so they are not swallowed by it.
  {
    path: 'events/:eventId/register',
    renderMode: RenderMode.Client,
  },

  {
    path: 'events/:eventId/my-registrations',
    renderMode: RenderMode.Client,
  },

  {
    path: 'events/:eventId/registrations/:registrationId',
    renderMode: RenderMode.Client,
  },

  {
    path: 'events/:eventId/certificates',
    renderMode: RenderMode.Client,
  },

  {
    path: 'events/:eventId/attendance',
    renderMode: RenderMode.Client,
  },

  {
    path: 'events/:eventId/feedback',
    renderMode: RenderMode.Client,
  },

  // Public event website stays server rendered.
  {
    path: 'events/:eventId',
    renderMode: RenderMode.Server,
  },

  {
    path: 'events/:eventId/:slug',
    renderMode: RenderMode.Server,
  },

  {
    path: 'login',
    renderMode: RenderMode.Client,
  },

  {
    path: 'register',
    renderMode: RenderMode.Client,
  },

  {
    path: 'create-event',
    renderMode: RenderMode.Client,
  },

  {
    path: 'my-events',
    renderMode: RenderMode.Client,
  },

  {
    path: 'organizer/**',
    renderMode: RenderMode.Client,
  },

  {
    path: 'owner/**',
    renderMode: RenderMode.Client,
  },

  {
    path: 'attendance-staff/**',
    renderMode: RenderMode.Client,
  },

  {
    path: 'photographer/**',
    renderMode: RenderMode.Client,
  },

  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];

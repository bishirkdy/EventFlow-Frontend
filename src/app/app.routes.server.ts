import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

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
    path: '**',
    renderMode: RenderMode.Server,
  },
];

export const ADMIN_ENDPOINTS = {
  events: '/v1/admin/events',
  eventById: (eventId: string) => `/v1/admin/events/${eventId}`,
  eventStats: '/v1/admin/events/stats',
  users: '/v1/admin/users',
  userStats: '/v1/admin/users/stats',
} as const;

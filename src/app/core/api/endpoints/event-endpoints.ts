export const EVENT_ENDPOINTS = {
  create: '/v1/events/create',
  myEvents: '/v1/events/my-events',
  byId: (eventId: string) => `/v1/events/${eventId}`,
} as const;
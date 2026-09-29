export const EVENT_ENDPOINTS = {
  create: '/v1/events/create',
  myEvents: '/v1/events/my-events',
  public: '/v1/events/public',
  byId: (eventId: string) => `/v1/events/${eventId}`,
  publish: (eventId: string) => `/v1/events/${eventId}/publish`,
} as const;
export const REGISTRATION_ENDPOINTS = {
  collection: (eventId: string) =>
    `/v1/events/${eventId}/registrations`,

  byId: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}`,

  manage: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}/manage`,

  mine: (eventId: string) =>
    `/v1/events/${eventId}/registrations/me`,

  stats: (eventId: string) =>
    `/v1/events/${eventId}/registrations/stats`,

  approve: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}/approve`,

  reject: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}/reject`,

  cancel: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}/cancel`,

  waitlist: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}/waitlist`,

  promote: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/registrations/${registrationId}/promote`,
} as const;

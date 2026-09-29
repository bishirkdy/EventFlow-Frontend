export const TICKET_ENDPOINTS = {
  byRegistration: (eventId: string, registrationId: string) =>
    `/v1/events/${eventId}/tickets/registration/${registrationId}`,

  verify: (eventId: string) =>
    `/v1/events/${eventId}/tickets/verify`,

  revoke: (eventId: string, ticketId: string) =>
    `/v1/events/${eventId}/tickets/${ticketId}/revoke`,
} as const;

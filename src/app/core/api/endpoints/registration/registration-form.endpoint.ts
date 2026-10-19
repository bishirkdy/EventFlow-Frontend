export const REGISTRATION_FORM_ENDPOINTS = {
  byEvent: (eventId: string) => `/v1/events/${eventId}/registration-form`,
  byScope: (eventId: string, scopeType: number, scopeId: string | null) =>
    `/v1/events/${eventId}/registration-form?scopeType=${scopeType}${
      scopeId ? `&scopeId=${scopeId}` : ''
    }`
} as const;

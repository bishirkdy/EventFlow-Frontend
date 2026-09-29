export const REGISTRATION_FORM_ENDPOINTS = {
  byEvent: (eventId: string) =>
    `/v1/events/${eventId}/registration-form`,
} as const;

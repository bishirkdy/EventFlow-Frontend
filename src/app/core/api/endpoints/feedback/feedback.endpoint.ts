export const FEEDBACK_ENDPOINTS = {
  submit: (eventId: string) => `/v1/events/${eventId}/feedback`,
  results: (eventId: string) => `/v1/events/${eventId}/feedback/results`,
} as const;

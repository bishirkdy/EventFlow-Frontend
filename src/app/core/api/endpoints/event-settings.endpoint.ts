export const EVENT_SETTINGS_ENDPOINTS = {
  getSettings: (eventId: string) => `/v1/events/${eventId}/settings`,
} as const;

export const EVENT_SETTINGS_ENDPOINTS = {
  getSettings: (eventId: string) =>
    `/v1/events-settings/${eventId}/settings`,

  updateSettings: (eventId: string) =>
    `/v1/events-settings/${eventId}/settings`,

  resetSettings: (eventId: string) =>
    `/v1/events-settings/${eventId}/settings/reset`,
} as const;
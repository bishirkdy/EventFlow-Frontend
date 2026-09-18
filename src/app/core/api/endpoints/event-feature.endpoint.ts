export const EVENT_FEATURE_ENDPOINTS = {
  getFeatures: (eventId: string) =>
    `/v1/events/${eventId}/features`,

  enable: (eventId: string, featureId: string) =>
    `/v1/events/${eventId}/features/${featureId}/enable`,

  disable: (eventId: string, featureId: string) =>
    `/v1/events/${eventId}/features/${featureId}/disable`,

  reset: (eventId: string) =>
    `/v1/events/${eventId}/features/reset`,
} as const;
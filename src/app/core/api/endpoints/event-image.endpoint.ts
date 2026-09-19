export const EVENT_IMAGE_ENDPOINTS = {
  uploadImages: (eventId: string) =>
    `/v1/events/${eventId}/images`,
} as const;
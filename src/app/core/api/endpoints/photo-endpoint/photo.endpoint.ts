export const PHOTO_ENDPOINTS = {
  uploadPhoto: (eventId: string) => `/v1/events/${encodeURIComponent(eventId)}/photos`,
  getPhotos: (eventId: string) => `/v1/events/${encodeURIComponent(eventId)}/photos`,

  deletePhoto: (eventId: string, photoId: string) =>
    `/v1/events/${encodeURIComponent(eventId)}/photos/${encodeURIComponent(photoId)}`,

  toggleVisibility: (eventId: string, photoId: string) =>
    `/v1/events/${encodeURIComponent(eventId)}/photos/${encodeURIComponent(photoId)}/visibility`,
} as const;

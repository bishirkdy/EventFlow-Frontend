export const VENUE_ENDPOINTS = {
  getVenues: (eventId: string) =>
    `/v1/events/${eventId}/venues`,

  createVenue: (eventId: string) =>
    `/v1/events/${eventId}/venues`,

  getVenueById: (eventId: string, venueId: string) =>
    `/v1/events/${eventId}/venues/${venueId}`,

  updateVenue: (eventId: string, venueId: string) =>
    `/v1/events/${eventId}/venues/${venueId}`,
} as const;
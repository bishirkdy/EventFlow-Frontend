export const SPONSOR_ENDPOINTS = {
  getSponsors: (eventId: string) => `/v1/events/${eventId}/sponsors`,
  getSponsorById: (eventId: string, sponsorId: string) => `/v1/events/${eventId}/sponsors/${sponsorId}`,
  createSponsor: (eventId: string) => `/v1/events/${eventId}/sponsors`,
  updateSponsor: (eventId: string, sponsorId: string) => `/v1/events/${eventId}/sponsors/${sponsorId}`,
  deleteSponsor: (eventId: string, sponsorId: string) => `/v1/events/${eventId}/sponsors/${sponsorId}`,
} as const;

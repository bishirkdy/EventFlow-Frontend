export const CERTIFICATE_ENDPOINTS = {
  settings: (eventId: string) =>
    `/v1/events/${eventId}/certificates/settings`,

  eligibility: (eventId: string) =>
    `/v1/events/${eventId}/certificates/eligibility`,

  generate: (eventId: string) =>
    `/v1/events/${eventId}/certificates/generate`,

  collection: (eventId: string) =>
    `/v1/events/${eventId}/certificates`,

  mine: (eventId: string) =>
    `/v1/events/${eventId}/certificates/my`,

  revoke: (eventId: string, certificateId: string) =>
    `/v1/events/${eventId}/certificates/${certificateId}/revoke`,

  download: (eventId: string, certificateId: string) =>
    `/v1/events/${eventId}/certificates/${certificateId}/download`,

  verify: (certificateNumber: string) =>
    `/v1/certificates/${certificateNumber}/verify`,
} as const;

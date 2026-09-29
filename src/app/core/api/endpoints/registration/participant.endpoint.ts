export const PARTICIPANT_ENDPOINTS = {
  collection: (eventId: string) =>
    `/v1/events/${eventId}/participants`,

  byId: (eventId: string, participantId: string) =>
    `/v1/events/${eventId}/participants/${participantId}`,
} as const;

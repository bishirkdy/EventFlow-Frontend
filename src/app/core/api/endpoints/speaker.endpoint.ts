export const SPEAKER_ENDPOINTS = {
  getSpeakers: (eventId: string) => `/v1/events/${eventId}/speakers`,
  getSpeakerById: (eventId: string, speakerId: string) => `/v1/events/${eventId}/speakers/${speakerId}`,
  createSpeaker: (eventId: string) => `/v1/events/${eventId}/speakers`,
  updateSpeaker: (eventId: string, speakerId: string) => `/v1/events/${eventId}/speakers/${speakerId}`,
  deleteSpeaker: (eventId: string, speakerId: string) => `/v1/events/${eventId}/speakers/${speakerId}`,
} as const;

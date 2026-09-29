export const SESSION_SPEAKER_ENDPOINTS = {
  get: (eventId: string, sessionId: string) => `/v1/events/${eventId}/sessions/${sessionId}/speakers`,
  assign: (eventId: string, sessionId: string, speakerId: string) => `/v1/events/${eventId}/sessions/${sessionId}/speakers/${speakerId}`,
  remove: (eventId: string, sessionId: string, speakerId: string) => `/v1/events/${eventId}/sessions/${sessionId}/speakers/${speakerId}`,
} as const;

export const SESSION_ENDPOINTS = {
  getSessions: (eventId: string) => `/v1/session/${eventId}/sessions`,

  getSessionById: (eventId: string, sessionId: string) =>
    `/v1/session/${eventId}/sessions/${sessionId}`,

  createSession: (eventId: string) => `/v1/session/${eventId}/sessions`,

  updateSession: (eventId: string, sessionId: string) =>
    `/v1/session/${eventId}/sessions/${sessionId}`,

  deleteSession: (eventId: string, sessionId: string) =>
    `/v1/session/${eventId}/sessions/${sessionId}`,
} as const;

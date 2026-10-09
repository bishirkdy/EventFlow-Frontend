export const PHOTOGRAPHER_ENDPOINTS = {
  getInvitations: (eventId: string) =>
    `/v1/events/${eventId}/photographers`,

  invite: (eventId: string) =>
    `/v1/events/${eventId}/photographers/invite`,

  revoke: (eventId: string, invitationId: string) =>
    `/v1/events/${eventId}/photographers/${invitationId}`,

  resend: (eventId: string, invitationId: string) =>
    `/v1/events/${eventId}/photographers/${invitationId}/resend`,
} as const;
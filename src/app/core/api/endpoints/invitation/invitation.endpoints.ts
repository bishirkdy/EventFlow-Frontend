export const INVITATION_ENDPOINTS = {
  getByToken: (token: string) =>
    `/v1/invitations/${encodeURIComponent(token)}`,

  accept: (token: string) =>
    `/v1/invitations/${encodeURIComponent(token)}/accept`,

  acceptExisting: (token: string) =>
    `/v1/invitations/${encodeURIComponent(token)}/accept-existing`,

  organizerInvitations: (eventId: string) =>
    `/v1/events/${eventId}/organizers`,

  inviteOrganizer: (eventId: string) =>
    `/v1/events/${eventId}/organizers/invite`,

  revokeOrganizerInvitation: (eventId: string, invitationId: string) =>
    `/v1/events/${eventId}/organizers/${invitationId}`,

  attendanceStaffInvitations: (eventId: string) =>
    `/v1/events/${eventId}/attendance-staff`,

  inviteAttendanceStaff: (eventId: string) =>
    `/v1/events/${eventId}/attendance-staff/invite`,

  revokeAttendanceStaffInvitation: (eventId: string, invitationId: string) =>
    `/v1/events/${eventId}/attendance-staff/${invitationId}`,
} as const;

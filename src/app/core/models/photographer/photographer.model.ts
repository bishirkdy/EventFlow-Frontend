export interface PhotographerInvitationModel {
  invitationId: string;
  eventId: string;
  email: string;
  roleName: string;
  status: number;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedByUserId?: string;
}
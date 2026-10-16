import { InvitationScopeType, InvitationType } from './invitation-type.enum';

export interface EventInvitationModel {
  invitationId: string;
  email: string;
  roleName: string;
  type: InvitationType;
  scopeType?: InvitationScopeType | null;
  scopeId?: string | null;
  status: number;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedByUserId?: string;
}

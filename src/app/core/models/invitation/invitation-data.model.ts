import { InvitationScopeType, InvitationType } from './invitation-type.enum';

export interface InvitationData {
  invitationId: string;
  eventId: string;
  eventName: string;
  email: string;
  roleName: string;
  type: InvitationType;
  scopeType?: InvitationScopeType | null;
  scopeId?: string | null;
  expiresAt: string;
  status: number;
}

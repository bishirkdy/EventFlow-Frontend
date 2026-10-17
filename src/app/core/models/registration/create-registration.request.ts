export interface CreateRegistrationRequest {
  scopeType?: number;
  scopeId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  designation?: string | null;
  answers: Record<string, string>;
}

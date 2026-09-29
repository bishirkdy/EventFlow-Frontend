export interface CreateRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  designation?: string | null;
  answers: Record<string, string>;
}

export interface UpdateRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  designation?: string | null;
  answers: Record<string, string>;
}

export interface RejectRegistrationRequest {
  reason: string;
}

export interface CancelRegistrationRequest {
  reason?: string | null;
}

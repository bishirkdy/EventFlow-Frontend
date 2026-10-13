export const PHOTOGRAPHER_INVITATION_ENDPOINTS = {
  getByToken: (token: string) =>
    `/v1/invitations/${encodeURIComponent(token)}`,

  accept: (token: string) =>
    `/v1/invitations/${encodeURIComponent(token)}/accept`,

  acceptExisting: (token: string) =>
    `/v1/invitations/${encodeURIComponent(token)}/accept-existing`,
} as const;
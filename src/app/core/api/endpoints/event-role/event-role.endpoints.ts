export const EVENT_ROLE_ENDPOINTS = {
  myRoles: (eventId: string, userId: string) => `/v1/events/${eventId}/users/${userId}/roles`,  
  team: (eventId: string) => `/v1/events/${eventId}/team`,
  teamAnalytics: (eventId: string) => `/v1/events/${eventId}/team/analytics`,
  organizers: (eventId: string) => `/v1/events/${eventId}/team/organizers`,
  removeOrganizer: (eventId: string, userId: string) =>
    `/v1/events/${eventId}/team/organizers/${userId}`,
} as const;

export interface AdminEventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  platformAdmins: number;
}

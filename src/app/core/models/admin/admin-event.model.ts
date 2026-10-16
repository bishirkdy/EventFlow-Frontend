export interface AdminEventListItem {
  id: string;
  name: string;
  eventType: string;
  subType: string | null;
  status: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  createdBy: string;
  createdAt: string;
}

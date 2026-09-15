export interface Event {
  id: string;
  name: string;
  description?: string;
  eventType: string;
  subType?: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  status: string;
  subdomain?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}
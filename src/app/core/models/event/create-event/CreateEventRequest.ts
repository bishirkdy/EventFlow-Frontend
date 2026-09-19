export interface CreateEventRequest {
  name: string;
  description?: string;
  eventType: string;
  subType?: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  images: File[];
}
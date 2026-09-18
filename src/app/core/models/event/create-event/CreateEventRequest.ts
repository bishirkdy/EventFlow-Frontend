export interface CreateEventRequest {
  name: string;
  eventType: string;
  startDate: string;
  endDate: string;
  description: string;
  timeZone: string;
}
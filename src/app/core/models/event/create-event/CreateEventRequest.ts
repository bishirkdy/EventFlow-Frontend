export interface CreateEventRequest {
  name: string;
  description: string;
  eventTypeId: string;
  subType: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  images: File[];
}
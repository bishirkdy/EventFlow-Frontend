import { EventImage } from './event-image.model';

export type EventStatus =
  | 'Draft'
  | 'Published'
  | 'Cancelled'
  | 'Completed';

export interface Event {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  subType: string | null;
  startDate: string;
  endDate: string;
  timeZone: string;
  status: EventStatus | string;
  subdomain: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string | null;
  images: EventImage[];
}

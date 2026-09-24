import { EventImage } from '../event-image.model';
import { EventStatus } from '../event.model';

export interface CreateEventResponse {
  id: string;
  name: string;
  description: string | null;
  eventTypeId: string;
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

export interface SessionModel {
  id: string;
  eventId: string;
  sectionId: string;
  title: string;
  description: string | null;
  sessionType: string;
  capacity: number | null;
  startTime: string | null;
  endTime: string | null;
  venueId: string | null;
  imageUrl: string | null;
  allowRegistration: boolean;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface SessionModel {
  id: string;
  eventId: string;
  sectionId: string;
  title: string;
  description: string | null;
  sessionType: string;
  capacity: number | null;
}
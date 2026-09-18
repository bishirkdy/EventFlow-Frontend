export interface SessionModel {
  id: string;
  eventId: string;
  sectionId: string;
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}




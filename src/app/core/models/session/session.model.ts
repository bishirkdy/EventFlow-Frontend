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

export interface CreateSessionRequest {
  sectionId: string;
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number;
}

export interface UpdateSessionRequest {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  venueId?: string | null;
  sectionId?: string | null;
}
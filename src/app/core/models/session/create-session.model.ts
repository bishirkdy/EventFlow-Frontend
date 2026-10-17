export interface CreateSessionModel {
  sectionId: string;
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  venueId?: string | null;
  allowRegistration?: boolean;
  image?: File;
}

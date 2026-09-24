export interface UpdateSessionModel {
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  venueId?: string | null;
  image?: File;
}

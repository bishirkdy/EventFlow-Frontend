export interface UpdateSessionRequest {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  venueId?: string | null;
  sectionId?: string | null;
}
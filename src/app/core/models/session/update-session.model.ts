export interface UpdateSessionModel {
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number | null;
}
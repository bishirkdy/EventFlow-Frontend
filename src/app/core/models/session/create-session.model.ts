export interface CreateSessionModel {
  sectionId: string;
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number | null;
}
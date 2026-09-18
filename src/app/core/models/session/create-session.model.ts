export interface CreateSessionRequest {
  sectionId: string;
  title: string;
  description?: string;
  sessionType: string;
  capacity?: number;
}
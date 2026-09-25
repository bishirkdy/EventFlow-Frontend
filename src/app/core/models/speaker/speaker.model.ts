export interface SpeakerModel {
  id: string;
  eventId: string;
  name: string;
  bio: string | null;
  designation: string | null;
  organization: string | null;
  email: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}
export interface SpeakerSessionModel { id: string; title: string; sessionType: string; startTime: string | null; endTime: string | null; }
export interface SpeakerDetailsModel extends SpeakerModel { sessions: SpeakerSessionModel[]; }

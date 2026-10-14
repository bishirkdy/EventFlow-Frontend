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

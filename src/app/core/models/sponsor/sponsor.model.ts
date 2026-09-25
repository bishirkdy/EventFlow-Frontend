export interface SponsorModel {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  sponsorLevel: string;
  displayOrder: number;
  isActive: boolean;
}

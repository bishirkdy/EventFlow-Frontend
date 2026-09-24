export interface VenueModel {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  address?: string;
  capacity: number;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface VenueModel {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  address?: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVenueRequest {
  name: string;
  description?: string;
  address?: string;
  capacity: number;
}
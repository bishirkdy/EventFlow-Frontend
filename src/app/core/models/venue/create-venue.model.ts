export interface CreateVenueRequest {
  name: string;
  description?: string;
  address?: string;
  capacity: number;
  image?: File;
}

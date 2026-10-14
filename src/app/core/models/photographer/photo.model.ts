export interface Photo {
  photoId: string;
  eventId: string;
  photographerId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isVisible: boolean;
  uploadedAt: string;
  approvedAt?: string;
}

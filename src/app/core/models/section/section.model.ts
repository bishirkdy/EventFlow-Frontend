export interface SectionModel {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSectionRequest {
  name: string;
  description?: string;
  displayOrder: number;
}
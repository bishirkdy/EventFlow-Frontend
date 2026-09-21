export interface EventPageModel {
  id: string;
  eventId: string;
  name: string;
  slug: string;
  pageType: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}
export interface PageSectionModel {
  id: string;
  pageId: string;
  sectionType: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  displayOrder: number;
  isVisible: boolean;
  configuration: string | null;
  createdAt: string;
  updatedAt: string | null;
}
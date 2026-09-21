export interface CreatePageSectionModel {
  sectionType: string;
  title?: string;
  content?: string;
  image?: File;
  displayOrder: number;
  configuration?: string;
}
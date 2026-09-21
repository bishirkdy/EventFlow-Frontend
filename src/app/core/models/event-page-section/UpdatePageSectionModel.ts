export interface UpdatePageSectionModel {
  sectionType: string;
  title?: string;
  content?: string;
  image?: File;
  displayOrder: number;
  isVisible: boolean;
  configuration?: string;
}
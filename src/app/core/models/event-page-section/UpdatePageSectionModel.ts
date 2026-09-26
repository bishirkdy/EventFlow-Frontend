export interface UpdatePageSectionModel {
  sectionType: string;
  title?: string;
  content?: string;
  image?: File;
  isVisible: boolean;
  configuration?: string;
}

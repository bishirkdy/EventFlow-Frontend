export interface UpdatePageSectionModel {
  sectionType: string;
  title?: string;
  content?: string;
  image?: File;
  isVisible: boolean;
  showRegistrationForm?: boolean;
  configuration?: string;
}

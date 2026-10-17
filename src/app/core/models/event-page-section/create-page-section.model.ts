export interface CreatePageSectionModel {
  sectionType: string;
  title?: string;
  content?: string;
  image?: File;
  showRegistrationForm?: boolean;
  configuration?: string;
}

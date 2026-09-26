export interface NavigationItemModel {
  id: string;
  navigationMenuId: string;
  label: string;
  pageId: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string | null;
}

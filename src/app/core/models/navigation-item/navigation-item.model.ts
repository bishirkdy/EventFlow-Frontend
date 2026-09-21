export interface NavigationItemModel {
  id: string;
  navigationMenuId: string;
  label: string;
  url: string | null;
  pageId: string | null;
  displayOrder: number;
  isVisible: boolean;
  openInNewTab: boolean;
}
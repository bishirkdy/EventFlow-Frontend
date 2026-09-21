export interface UpdateNavigationItemModel {
  label: string;
  url?: string | null;
  pageId?: string | null;
  displayOrder: number;
  openInNewTab: boolean;
  isVisible: boolean;
}
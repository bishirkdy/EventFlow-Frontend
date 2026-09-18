export interface UpdateNavigationItemRequest {
  label: string;
  url?: string;
  pageId?: string;
  displayOrder: number;
  openInNewTab: boolean;
  isVisible: boolean;
}
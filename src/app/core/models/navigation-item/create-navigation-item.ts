export interface CreateNavigationItemRequest {
  label: string;
  url?: string;
  pageId?: string;
  displayOrder: number;
  openInNewTab: boolean;
}
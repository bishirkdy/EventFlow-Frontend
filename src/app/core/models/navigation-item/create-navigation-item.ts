export interface CreateNavigationItemModel {
  label: string;
  url?: string | null;
  pageId?: string | null;
  displayOrder: number;
  openInNewTab: boolean;
}
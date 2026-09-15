export interface NavigationItemModel {
  id: string;
  navigationMenuId: string;
  label: string;
  url?: string;
  pageId?: string;
  displayOrder: number;
  isVisible: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNavigationItemRequest {
  label: string;
  url?: string;
  pageId?: string;
  displayOrder: number;
  openInNewTab: boolean;
}

export interface UpdateNavigationItemRequest {
  label: string;
  url?: string;
  pageId?: string;
  displayOrder: number;
  openInNewTab: boolean;
  isVisible: boolean;
}

export interface ReorderNavigationItemsRequest {
  itemIds: string[];
}

export interface UpdateNavigationItemVisibilityRequest {
  isVisible: boolean;
}
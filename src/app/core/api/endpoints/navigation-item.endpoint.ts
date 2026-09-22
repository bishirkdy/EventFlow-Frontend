export const NAVIGATION_ITEM_ENDPOINTS = {
  getItems: (navigationMenuId: string) => `/v1/navigation-items/${navigationMenuId}/items`,

  createItem: (navigationMenuId: string) => `/v1/navigation-items/${navigationMenuId}/items`,

  updateItem: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}`,

  deleteItem: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}`,

  reorderItems: (navigationMenuId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/reorder`,

  setVisibility: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}/visibility`,

  getItemByPage: (pageId: string) => `/v1/navigation-items/page/${pageId}`,
} as const;

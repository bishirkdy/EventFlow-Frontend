export const NAVIGATION_ITEM_ENDPOINTS = {
  getItems: (navigationMenuId: string) => `/v1/navigation-items/${navigationMenuId}/items`,

  getItemById: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}`,

  createItem: (navigationMenuId: string) => `/v1/navigation-items/${navigationMenuId}/items`,

  updateItem: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}`,

  deleteItem: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}`,

  reorderItems: (navigationMenuId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/reorder`,

  updateVisibility: (navigationMenuId: string, itemId: string) =>
    `/v1/navigation-items/${navigationMenuId}/items/${itemId}/visibility`,
} as const;

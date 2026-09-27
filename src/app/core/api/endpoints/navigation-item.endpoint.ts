export const NAVIGATION_ITEM_ENDPOINTS = {
  getItems: (eventId: string) =>
    `/v1/navigation-items/${eventId}`,

  createItem: (eventId: string) =>
    `/v1/navigation-items/${eventId}`,

  updateItem: (eventId: string, itemId: string) =>
    `/v1/navigation-items/${eventId}/${itemId}`,

  deleteItem: (eventId: string, itemId: string) =>
    `/v1/navigation-items/${eventId}/${itemId}`,

  reorderItems: (eventId: string) =>
    `/v1/navigation-items/${eventId}/reorder`,

  setVisibility: (eventId: string, itemId: string) =>
    `/v1/navigation-items/${eventId}/${itemId}/visibility`,

  getItemByPage: (pageId: string) =>
    `/v1/navigation-items/page/${pageId}`,
} as const;
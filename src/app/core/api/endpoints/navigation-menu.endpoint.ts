export const NAVIGATION_MENU_ENDPOINTS = {
  getMenus: (eventId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus`,

  createMenu: (eventId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus`,

  getMenuById: (eventId: string, menuId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`,

  updateMenu: (eventId: string, menuId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`,

  deleteMenu: (eventId: string, menuId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`,
} as const;
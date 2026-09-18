export const NAVIGATION_MENU_ENDPOINTS = {
  getMenus: (eventId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus`,

  getMenuById: (eventId: string, menuId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`,

  createMenu: (eventId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus`,

  updateMenu: (eventId: string, menuId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`,

  deleteMenu: (eventId: string, menuId: string) =>
    `/v1/navigation-menu/${eventId}/navigation-menus/${menuId}`,
} as const;
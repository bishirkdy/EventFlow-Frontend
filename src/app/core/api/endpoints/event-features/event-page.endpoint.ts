export const EVENT_PAGE_ENDPOINTS = {
  getPages: (eventId: string) =>
    `/v1/event-page/${eventId}/pages`,

  getManagePages: (eventId: string) =>
    `/v1/event-page/${eventId}/manage-pages`,

  getPreviewPages: (eventId: string) =>
    `/v1/event-page/${eventId}/preview`,

  createPage: (eventId: string) =>
    `/v1/event-page/${eventId}/pages`,

  updatePage: (eventId: string, pageId: string) =>
    `/v1/event-page/${eventId}/pages/${pageId}`,

  publishPage: (eventId: string, pageId: string) =>
    `/v1/event-page/${eventId}/pages/${pageId}/publish`,

  unpublishPage: (eventId: string, pageId: string) =>
    `/v1/event-page/${eventId}/pages/${pageId}/unpublish`,

  deletePage: (eventId: string, pageId: string) =>
    `/v1/event-page/${eventId}/pages/${pageId}`,

  getPageById: (eventId: string, pageId: string) =>
    `/v1/event-page/${eventId}/pages/${pageId}`,

  getManagePageById: (eventId: string, pageId: string) =>
    `/v1/event-page/${eventId}/manage-pages/${pageId}`,

  reorderPages: (eventId: string) =>
    `/v1/event-page/${eventId}/pages/reorder`,

  ensureWebsite: (eventId: string) =>
    `/v1/event-page/${eventId}/ensure-website`,
} as const;
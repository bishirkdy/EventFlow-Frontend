export const EVENT_PAGE_ENDPOINTS = {
  getPages: (eventId: string) =>
    `/v1/event-page/${eventId}/pages`,

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
} as const;
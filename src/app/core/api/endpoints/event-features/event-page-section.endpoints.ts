export const PAGE_SECTION_ENDPOINTS = {
  getSections: (pageId: string) =>
    `/v1/page-section/${pageId}/sections`,

  getSectionsByEvent: (eventId: string) =>
    `/v1/page-section/event/${eventId}/sections`,

  getSectionsByEventPreview: (eventId: string) =>
    `/v1/page-section/event/${eventId}/preview-sections`,

  getManageSections: (pageId: string) =>
    `/v1/page-section/${pageId}/manage-sections`,

  createSection: (pageId: string) =>
    `/v1/page-section/${pageId}/sections`,

  updateSection: (pageId: string, sectionId: string) =>
    `/v1/page-section/${pageId}/sections/${sectionId}`,

  deleteSection: (pageId: string, sectionId: string) =>
    `/v1/page-section/${pageId}/sections/${sectionId}`,

  reorderSections: (pageId: string) =>
    `/v1/page-section/${pageId}/sections/reorder`,
} as const;
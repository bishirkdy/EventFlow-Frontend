export const PAGE_SECTION_ENDPOINTS = {
  getSections: (pageId: string) =>
    `/v1/page-section/${pageId}/sections`,

  createSection: (pageId: string) =>
    `/v1/page-section/${pageId}/sections`,

  updateSection: (pageId: string, sectionId: string) =>
    `/v1/page-section/${pageId}/sections/${sectionId}`,

  deleteSection: (pageId: string, sectionId: string) =>
    `/v1/page-section/${pageId}/sections/${sectionId}`,

  reorderSections: (pageId: string) =>
    `/v1/page-section/${pageId}/sections/reorder`,
} as const;
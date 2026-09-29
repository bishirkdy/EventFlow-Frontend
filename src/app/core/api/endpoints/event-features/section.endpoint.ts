export const SECTION_ENDPOINTS = {
  getSections: (eventId: string) => `/v1/section/${eventId}/sections`,

  getSectionById: (sectionId: string) => `/v1/section/sections/${sectionId}`,

  createSection: (eventId: string) => `/v1/section/${eventId}/sections`,

  updateSection: (eventId: string, sectionId: string) =>
    `/v1/section/${eventId}/sections/${sectionId}`,

  deleteSection: (eventId: string, sectionId: string) =>
    `/v1/section/${eventId}/sections/${sectionId}`,
} as const;

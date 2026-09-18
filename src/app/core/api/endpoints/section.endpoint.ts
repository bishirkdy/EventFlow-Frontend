export const SECTION_ENDPOINTS = {
  getSections: (eventId: string) =>
    `/v1/section/${eventId}/sections`,

  createSection: (eventId: string) =>
    `/v1/section/${eventId}/sections`,

  getSectionById: (eventId: string, sectionId: string) =>
    `/v1/section/${eventId}/sections/${sectionId}`,

  deleteSection: (eventId: string, sectionId: string) =>
    `/v1/section/${eventId}/sections/${sectionId}`,
} as const;
export const eventWorkspaceUrl = (eventId: string, ...segments: string[]) => [
  '/organizer',
  eventId,
  ...segments,
];

export const participantEventUrl = (eventId: string, ...segments: string[]) => [
  '/participant',
  eventId,
  ...segments,
];

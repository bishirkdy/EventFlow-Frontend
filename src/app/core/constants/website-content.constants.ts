export const EVENT_PAGE_TYPES = [
  'Home',
  'About',
  'Schedule',
  'Venue',
  'Gallery',
  'Speakers',
  'Sponsors',
  'Contact',
  'Custom',
] as const;

export const PAGE_SECTION_TYPES = [
  { value: 'hero', label: 'Hero', description: 'Large opening section with title, text and optional image.' },
  { value: 'text', label: 'Text / Story', description: 'Editorial content or an event story.' },
  { value: 'details', label: 'Event Details', description: 'Important event information and description.' },
  { value: 'schedule', label: 'Schedule', description: 'Render sessions from this event.' },
  { value: 'venue', label: 'Venue', description: 'Render the event venues.' },
  { value: 'gallery', label: 'Gallery', description: 'Render the event images.' },
  { value: 'custom', label: 'Custom', description: 'Use the generic content renderer.' },
] as const;

export const NAVIGATION_LOCATIONS = [
  { value: 'Header', label: 'Header' },
  { value: 'Footer', label: 'Footer' },
] as const;

export interface OrganizerNavItem {
  label: string;
  route: string;
  icon: string;
}

export const ORGANIZER_NAVIGATION: OrganizerNavItem[] = [
  {
    label: 'Overview',
    route: 'overview',
    icon: 'layout-dashboard',
  },
  {
    label: 'Schedule',
    route: 'schedule',
    icon: 'calendar',
  },
  {
    label: 'Venues',
    route: 'venues',
    icon: 'map-pin',
  },
  {
    label: 'Sessions',
    route: 'sessions',
    icon: 'calendar-days',
  },
  {
    label: 'Participants',
    route: 'participants',
    icon: 'users',
  },
  {
    label: 'Pages',
    route: 'pages',
    icon: 'file-text',
  },
  {
    label: 'Sections',
    route: 'sections',
    icon: 'layout-list',
  },
  {
    label: 'Navigation',
    route: 'navigation',
    icon: 'menu',
  },
  {
    label: 'Photos',
    route: 'photos',
    icon: 'image',
  },
  {
    label: 'Announcements',
    route: 'announcements',
    icon: 'megaphone',
  },
  {
    label: 'Settings',
    route: 'settings',
    icon: 'settings',
  },
];
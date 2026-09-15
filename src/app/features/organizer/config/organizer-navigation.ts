export interface OrganizerNavItem {
  label: string;
  route: string;
  icon: string;
}

export const ORGANIZER_NAVIGATION: Record<string, OrganizerNavItem[]> = {

  'Wedding & Private Events': [
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
      label: 'Guests',
      route: 'guests',
      icon: 'users',
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
  ],

  'Conference & Business': [
    {
      label: 'Overview',
      route: '',
      icon: 'layout-dashboard',
    },
    {
      label: 'Schedule',
      route: 'schedule',
      icon: 'calendar',
    },
    {
      label: 'Speakers',
      route: 'speakers',
      icon: 'mic',
    },
    {
      label: 'Sponsors',
      route: 'sponsors',
      icon: 'handshake',
    },
    {
      label: 'Registrations',
      route: 'registrations',
      icon: 'users',
    },
    {
      label: 'Announcements',
      route: 'announcements',
      icon: 'megaphone',
    },
  ],

  'Education & Workshop': [
    {
      label: 'Overview',
      route: '',
      icon: 'layout-dashboard',
    },
    {
      label: 'Schedule',
      route: 'schedule',
      icon: 'calendar',
    },
    {
      label: 'Participants',
      route: 'participants',
      icon: 'users',
    },
    {
      label: 'Attendance',
      route: 'attendance',
      icon: 'clipboard-check',
    },
    {
      label: 'Certificates',
      route: 'certificates',
      icon: 'award',
    },
  ],

  'Festival & Cultural': [
    {
      label: 'Overview',
      route: '',
      icon: 'layout-dashboard',
    },
    {
      label: 'Schedule',
      route: 'schedule',
      icon: 'calendar',
    },
    {
      label: 'Programs',
      route: 'programs',
      icon: 'list',
    },
    {
      label: 'Participants',
      route: 'participants',
      icon: 'users',
    },
    {
      label: 'Attendance',
      route: 'attendance',
      icon: 'clipboard-check',
    },
    {
      label: 'Results',
      route: 'results',
      icon: 'trophy',
    },
  ],

  'Sports & Competition': [
    {
      label: 'Overview',
      route: '',
      icon: 'layout-dashboard',
    },
    {
      label: 'Schedule',
      route: 'schedule',
      icon: 'calendar',
    },
    {
      label: 'Participants',
      route: 'participants',
      icon: 'users',
    },
    {
      label: 'Teams',
      route: 'teams',
      icon: 'users',
    },
    {
      label: 'Results',
      route: 'results',
      icon: 'trophy',
    },
    {
      label: 'Attendance',
      route: 'attendance',
      icon: 'clipboard-check',
    },
  ],

};
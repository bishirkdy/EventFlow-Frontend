import type { LucideIconData } from 'lucide-angular';

import {
  LayoutDashboard,
  Calendar,
  MapPin,
  CalendarDays,
  Users,
  FileText,
  List,
  Menu,
  Image,
  Megaphone,
  Settings,
  Eye,
  FileArchiveIcon
} from 'lucide-angular';

export interface OrganizerNavItem {
  label: string;
  route: string;
  icon: LucideIconData;
}

export const ORGANIZER_NAVIGATION: OrganizerNavItem[] = [
  {
    label: 'Overview',
    route: 'overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Features',
    route: 'features',
    icon: FileArchiveIcon,
  },
  {
    label: 'Settings',
    route: 'settings',
    icon: Settings,
  },

  {
    label: 'Venues',
    route: 'venues',
    icon: MapPin,
  },
  {
    label: 'Sessions',
    route: 'sessions',
    icon: CalendarDays,
  },
  {
    label: 'Sections',
    route: 'sections',
    icon: List,
  },
  {
    label: 'Participants',
    route: 'participants',
    icon: Users,
  },

  // Event Website
  {
    label: 'Pages',
    route: 'pages',
    icon: FileText,
  },
  {
    label: 'Navigation',
    route: 'navigation-menus',
    icon: Menu,
  },
  {
    label: 'Preview Website',
    route: 'preview',
    icon: Eye,
  },
  {
    label: 'Photos',
    route: 'photos',
    icon: Image,
  },
  {
    label: 'Announcements',
    route: 'announcements',
    icon: Megaphone,
  },
];

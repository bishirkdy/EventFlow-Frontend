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
    label: 'Schedule',
    route: 'schedule',
    icon: Calendar,
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
    label: 'Participants',
    route: 'participants',
    icon: Users,
  },
  {
    label: 'Pages',
    route: 'pages',
    icon: FileText,
  },
  {
    label: 'Sections',
    route: 'sections',
    icon: List,
  },
  {
    label: 'Navigation',
    route: 'navigation',
    icon: Menu,
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
  {
    label: 'Settings',
    route: 'settings',
    icon: Settings,
  },
];
import type { LucideIconData } from 'lucide-angular';
import {
  LayoutDashboard,
  Home,
  MapPin,
  CalendarDays,
  FileText,
  List,
  Menu,
  Eye,
  FileArchiveIcon,
  Mic2,
  Handshake,
  ClipboardList,
  ScanLine,
  UserCog,
  Bell,
} from 'lucide-angular';

export interface OrganizerNavItem {
  label: string;
  route: string;
  icon: LucideIconData;
  feature?: string;
}

export const ORGANIZER_NAVIGATION: OrganizerNavItem[] = [
  { label: 'Overview', route: 'overview', icon: LayoutDashboard },
  { label: 'Website Home', route: 'preview', icon: Home },
  { label: 'Features', route: 'features', icon: FileArchiveIcon },
  { label: 'Sections', route: 'sections', icon: List, feature: 'sessions' },
  { label: 'Sessions', route: 'sessions', icon: CalendarDays, feature: 'sessions' },
  { label: 'Venues', route: 'venues', icon: MapPin, feature: 'venues' },
  { label: 'Speakers', route: 'speakers', icon: Mic2, feature: 'speakers' },
  { label: 'Sponsors', route: 'sponsors', icon: Handshake, feature: 'sponsors' },
  { label: 'Registration', route: 'registration', icon: ClipboardList, feature: 'registration' },
  { label: 'Attendance', route: 'attendance', icon: ScanLine },
  { label: 'Attendance Staff', route: 'attendance-staff', icon: UserCog },
  { label: 'Notifications', route: 'notifications', icon: Bell },
  { label: 'Pages', route: 'pages', icon: FileText },
  { label: 'Navigation', route: 'navigation', icon: Menu },
];

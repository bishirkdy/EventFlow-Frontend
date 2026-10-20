import type { LucideIconData } from 'lucide-angular';
import {
  LayoutDashboard,
  Settings2,
  MapPin,
  CalendarDays,
  FileText,
  List,
  Menu,
  Eye,
  Mic2,
  Handshake,
  ClipboardList,
  ScanLine,
  UserCog,
  Bell,
  Users,
  FormInput,
  Camera,
  Award,
  MessageSquare
} from 'lucide-angular';

export interface OrganizerNavItem {
  label: string;
  route: string;
  icon: LucideIconData;
  feature?: string;
  permission?: string;
}

export interface OrganizerNavGroup {
  label: string;
  items: OrganizerNavItem[];
}

export const ORGANIZER_NAVIGATION: OrganizerNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', route: 'overview', icon: LayoutDashboard },
      { label: 'Event Details', route: 'event/details', icon: Settings2 }
    ]
  },
  {
    label: 'Event Website',
    items: [
      { label: 'Pages', route: 'pages', icon: FileText },
      { label: 'Navigation', route: 'navigation', icon: Menu },
      { label: 'Features', route: 'features', icon: List }
    ]
  },
  {
    label: 'Programme',
    items: [
      { label: 'Sections', route: 'sections', icon: List, feature: 'sessions' },
      { label: 'Sessions', route: 'sessions', icon: CalendarDays, feature: 'sessions' },
      { label: 'Venues', route: 'venues', icon: MapPin, feature: 'venues' },
      { label: 'Speakers', route: 'speakers', icon: Mic2, feature: 'speakers' },
      { label: 'Sponsors', route: 'sponsors', icon: Handshake, feature: 'sponsors' }
    ]
  },
  {
    label: 'Registration',
    items: [
      {
        label: 'Registration Management',
        route: 'registration/registrations',
        icon: ClipboardList,
        feature: 'registration'
      },
      {
        label: 'Form Builder',
        route: 'registration/form',
        icon: FormInput,
        feature: 'registration'
      },
      {
        label: 'Participants',
        route: 'registration/participants',
        icon: Users,
        feature: 'registration'
      },
      {
        label: 'Certificates',
        route: 'certificates',
        icon: Award,
        feature: 'certificates'
      }
    ]
  },
  {
    label: 'Attendance',
    items: [
      { label: 'Attendance Dashboard', route: 'attendance', icon: ScanLine, feature: 'attendance' },
      {
        label: 'Attendance Staff',
        route: 'attendance-staff',
        icon: UserCog,
        feature: 'attendance',
        permission: 'event.team.manage'
      }
    ]
  },
  {
    label: 'Communication',
    items: [
      { label: 'Notifications', route: 'notifications', icon: Bell },
      { label: 'Feedback', route: 'feedback', icon: MessageSquare, feature: 'feedback' }
    ]
  },
  {
    label: 'Media',
    items: [
      {
        label: 'Photographers',
        route: 'photographers',
        icon: Camera,
        feature: 'gallery',
        permission: 'event.team.manage'
      },
      { label: 'Photo Moderation', route: 'photos', icon: Eye, feature: 'gallery' }
    ]
  }
];

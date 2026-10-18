import type { LucideIconData } from 'lucide-angular';
import { CalendarDays, LayoutDashboard, Users } from 'lucide-angular';

export interface AdminNavItem {
  label: string;
  route: string;
  icon: LucideIconData;
}

export const ADMIN_NAVIGATION: AdminNavItem[] = [
  { label: 'Dashboard', route: 'dashboard', icon: LayoutDashboard },
  { label: 'Events', route: 'events', icon: CalendarDays },
  { label: 'Users', route: 'users', icon: Users }
];

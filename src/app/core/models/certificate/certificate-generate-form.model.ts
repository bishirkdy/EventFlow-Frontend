export interface SettingsForm {
  title: string;
  subtitle: string;
  signatoryName: string;
  signatoryTitle: string;
  themeColor: string;
  requireApprovedRegistration: boolean;
  minAttendancePercent: number | null;
}

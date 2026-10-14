import { CapacityMode } from './capacity-mode.enum';
import { RegistrationFormFieldModel } from './registration-form-field.model';

export interface RegistrationFormModel {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  capacityMode: CapacityMode;
  capacity: number | null;
  approvedCount: number;
  waitlistCount: number;
  enableWaitlist: boolean;
  opensAtUtc: string | null;
  closesAtUtc: string | null;
  fields: RegistrationFormFieldModel[];
}

import { CapacityMode } from './capacity-mode.enum';
import { RegistrationFormFieldModel } from './registration-form-field.model';
import { RegistrationScope } from './registration-scope.enum';

export interface RegistrationFormModel {
  id: string;
  eventId: string;
  scopeType: RegistrationScope;
  scopeId: string | null;
  isInherited: boolean;
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

import { CapacityMode } from './capacity-mode.enum';
import { RegistrationFormFieldRequest } from './registration-form-field-request.request';

export interface UpsertRegistrationFormRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
  capacityMode: CapacityMode;
  capacity?: number | null;
  enableWaitlist: boolean;
  opensAtUtc?: string | null;
  closesAtUtc?: string | null;
  fields: RegistrationFormFieldRequest[];
}

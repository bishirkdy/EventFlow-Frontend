import { CapacityMode } from './capacity-mode.enum';
import { RegistrationFormFieldRequest } from './registration-form-field-request.request';
import { RegistrationScope } from './registration-scope.enum';

export interface UpsertRegistrationFormRequest {
  scopeType: RegistrationScope;
  scopeId?: string | null;
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

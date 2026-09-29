import {
  CapacityMode,
  RegistrationFieldType,
} from './registration.enums';

export interface RegistrationFormFieldRequest {
  fieldKey: string;
  label: string;
  fieldType: RegistrationFieldType;
  isRequired: boolean;
  displayOrder: number;
  optionsJson?: string | null;
  validationJson?: string | null;
}

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

export interface RegistrationFormFieldModel {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: RegistrationFieldType;
  isRequired: boolean;
  displayOrder: number;
  optionsJson: string | null;
  validationJson: string | null;
}

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

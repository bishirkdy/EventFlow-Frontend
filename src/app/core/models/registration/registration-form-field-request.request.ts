import { RegistrationFieldType } from './registration-field-type.enum';

export interface RegistrationFormFieldRequest {
  id?: string | null;
  fieldKey: string;
  label: string;
  fieldType: RegistrationFieldType;
  isRequired: boolean;
  displayOrder: number;
  optionsJson?: string | null;
  validationJson?: string | null;
}

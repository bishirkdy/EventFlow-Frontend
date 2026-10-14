import { RegistrationFieldType } from './registration-field-type.enum';

export interface EditableField {
  id?: string;
  fieldKey: string;
  label: string;
  fieldType: RegistrationFieldType;
  isRequired: boolean;
  optionsJson: string | null;
  validationJson: string | null;
}

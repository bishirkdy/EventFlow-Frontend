import { RegistrationFieldType } from "./registration.enums";

export interface EditableField {
  id?: string;
  fieldKey: string;
  label: string;
  fieldType: RegistrationFieldType;
  isRequired: boolean;
  optionsJson: string | null;
  validationJson: string | null;
}
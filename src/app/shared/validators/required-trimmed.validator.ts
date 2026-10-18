import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const trimmedRequiredValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (value === null || value === undefined) {
    return { required: true };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { required: true };
  }

  return null;
};

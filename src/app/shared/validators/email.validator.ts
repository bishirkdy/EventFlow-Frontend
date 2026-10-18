import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const EMAIL_PATTERN = /^[A-Za-z][A-Za-z0-9._-]*@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export const emailValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  return isValidEmail(String(value)) ? null : { email: true };
};

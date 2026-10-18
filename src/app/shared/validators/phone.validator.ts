import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PHONE_CHARS = /^\+?[\d\s().-]+$/;

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed === '') {
    return true;
  }

  if (!PHONE_CHARS.test(trimmed)) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, '');

  return digits.length >= 7 && digits.length <= 15;
}

export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  return isValidPhone(String(value)) ? null : { phone: true };
};

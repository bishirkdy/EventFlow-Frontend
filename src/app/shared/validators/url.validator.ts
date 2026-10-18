import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed === '') {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const urlValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  return isValidUrl(String(value)) ? null : { url: true };
};

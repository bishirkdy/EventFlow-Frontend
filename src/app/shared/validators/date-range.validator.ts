import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) {
    return null;
  }

  return new Date(endDate) > new Date(startDate) ? null : { dateInvalid: true };
}

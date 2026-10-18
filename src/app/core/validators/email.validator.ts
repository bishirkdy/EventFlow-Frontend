import { Injectable } from '@angular/core';
import { isValidEmail } from '../../shared/validators/email.validator';

@Injectable({ providedIn: 'root' })
export class EmailValidator {
  isValid(email: string): boolean {
    return isValidEmail(email);
  }
}

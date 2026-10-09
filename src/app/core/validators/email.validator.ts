import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailValidator {
  isValid(email: string): boolean {
    const emailRegex = /^[A-Za-z][A-Za-z0-9._-]*@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/;

    return emailRegex.test(email.trim());
  }
}
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailValidator {
  isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
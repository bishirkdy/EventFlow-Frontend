import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-error-state',
  imports: [Button],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css'
})
export class ErrorState {
  message = input('Something went wrong.');
  variant = input<'block' | 'inline'>('block');
  showRetry = input(false);
  retryLabel = input('Try again');
  retry = output<void>();
}

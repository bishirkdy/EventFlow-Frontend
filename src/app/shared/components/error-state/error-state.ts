import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  imports: [],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorState {
  message = input('Something went wrong.');
  showRetry = input(false);
  retryLabel = input('Try again');
  retry = output<void>();
}

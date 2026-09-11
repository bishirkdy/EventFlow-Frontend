import { Component, input } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  message = input<string>('');
  variant = input<'info' | 'success' | 'warning' | 'error'>('info');
}

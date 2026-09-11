import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  label = input<string>('');
  variant = input<'primary' | 'success' | 'warning' | 'error' | 'neutral'>('primary');
}

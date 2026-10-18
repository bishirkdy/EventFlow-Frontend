import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-empty-state',
  imports: [Button],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  title = input<string>('Nothing here');
  message = input<string>('');
  icon = input<string>('+');
  actionLabel = input<string>('');
  action = output<void>();
}

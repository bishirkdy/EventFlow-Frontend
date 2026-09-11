import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  standalone : true,
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  label = input<string>('');
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md')
}

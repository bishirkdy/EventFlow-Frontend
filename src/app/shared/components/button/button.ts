import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  label = input<string>('');
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);

  readonly isDisabled = computed(() => this.disabled() || this.loading());
}

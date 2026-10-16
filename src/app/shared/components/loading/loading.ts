import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  label = input('');
  size = input<'sm' | 'md' | 'lg'>('md');
  align = input<'center' | 'start'>('center');
  ariaLabel = input('Loading');

  readonly spinnerClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-4 w-4 border';
      case 'lg':
        return 'h-10 w-10 border-2';
      default:
        return 'h-6 w-6 border-2';
    }
  });
}

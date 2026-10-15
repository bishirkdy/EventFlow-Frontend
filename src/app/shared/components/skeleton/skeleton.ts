import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  count = input(1);
  blockClass = input('h-4 w-full');

  readonly blocks = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, index) => index),
  );

  readonly blockClasses = computed(
    () => `animate-pulse rounded bg-background ${this.blockClass()}`,
  );
}

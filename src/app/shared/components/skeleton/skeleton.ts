import { Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'lines' | 'cards' | 'list' | 'table' | 'detail';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  variant = input<SkeletonVariant>('lines');
  count = input(1);
  blockClass = input('h-4 w-full');

  readonly items = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, index) => index),
  );

  readonly lineClasses = computed(() => `animate-pulse rounded bg-background ${this.blockClass()}`);
}

import { Component, contentChild, input, output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Skeleton, SkeletonVariant } from '../skeleton/skeleton';
import { Loading } from '../loading/loading';
import { ErrorState } from '../error-state/error-state';
import { EmptyState } from '../empty-state/empty-state';

/**
 * Standardises the four async branches (loading / error / empty / content) so
 * pages don't hand-roll the same `@if (loading()) ... @else if (error()) ...`
 * block in every component.
 *
 * Usage:
 * <app-async-state
 *   [loading]="loading()"
 *   [error]="error()"
 *   [empty]="items().length === 0"
 *   skeleton="cards"
 *   [skeletonCount]="6"
 *   emptyTitle="No events yet"
 *   (retry)="load()">
 *   <ng-template>
 *     <!-- real content, only rendered once loaded -->
 *   </ng-template>
 * </app-async-state>
 */

@Component({
  selector: 'app-async-state',
  imports: [NgTemplateOutlet, Skeleton, Loading, ErrorState, EmptyState],
  templateUrl: './async-state.html',
  styleUrl: './async-state.css'
})
export class AsyncState {
  loading = input(false);
  error = input<string | null>(null);
  empty = input(false);

  layout = input<'block' | 'inline'>('block');
  loadingView = input<'skeleton' | 'spinner' | 'text'>('skeleton');
  loadingLabel = input('');

  skeleton = input<SkeletonVariant>('lines');
  skeletonCount = input(3);

  emptyTitle = input('Nothing here');
  emptyMessage = input('');
  emptyActionLabel = input('');

  showRetry = input(true);
  retryLabel = input('Try again');
  errorFallback = input('Something went wrong.');

  retry = output<void>();
  emptyAction = output<void>();

  readonly content = contentChild<TemplateRef<unknown>>(TemplateRef);
}

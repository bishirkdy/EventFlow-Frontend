import { Component, contentChild, input, output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Skeleton, SkeletonVariant } from '../skeleton/skeleton';
import { Loading } from '../loading/loading';
import { ErrorState } from '../error-state/error-state';
import { EmptyState } from '../empty-state/empty-state';

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

import { assertInInjectionContext, signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { getApiErrorMessage } from '../api/api-error';
import { ApiResponse } from '../models/common';

export interface AsyncState<T> {
  readonly data: Signal<T>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  load(): void;
}

export interface AsyncStateOptions<T> {
  initial?: T;
  autoLoad?: boolean;
  errorFallback?: string;
  onSuccess?: (data: T) => void;
}

export function createAsyncState<T>(
  factory: () => Observable<ApiResponse<T>>,
  options: AsyncStateOptions<T> & { initial: T },
): AsyncState<T>;
export function createAsyncState<T>(
  factory: () => Observable<ApiResponse<T>>,
  options?: AsyncStateOptions<T>,
): AsyncState<T | null>;
export function createAsyncState<T>(
  factory: () => Observable<ApiResponse<T>>,
  options: AsyncStateOptions<T> = {},
): AsyncState<T | null> {
  assertInInjectionContext(createAsyncState);

  const untilDestroyed = takeUntilDestroyed<ApiResponse<T>>();
  const initial: T | null = 'initial' in options ? (options.initial as T) : null;
  const data = signal<T | null>(initial);
  const loading = signal(false);
  const error = signal<string | null>(null);

  const load = (): void => {
    loading.set(true);
    error.set(null);

    factory().pipe(untilDestroyed).subscribe({
      next: (response) => {
        const value = response.data ?? initial;
        data.set(value);
        loading.set(false);
        if (value !== null && value !== undefined) {
          options.onSuccess?.(value);
        }
      },
      error: (requestError: unknown) => {
        error.set(
          getApiErrorMessage(requestError, options.errorFallback ?? 'Something went wrong.'),
        );
        loading.set(false);
      },
    });
  };

  if (options.autoLoad) {
    load();
  }

  return {
    data: data.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    load,
  };
}

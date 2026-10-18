import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, Subject, throwError } from 'rxjs';
import { ApiResponse } from '../models/common';
import { createAsyncState, createRawAsyncState } from './async-state';

const ok = <T>(data: T): ApiResponse<T> => ({
  isSuccess: true,
  statusCode: 200,
  message: 'ok',
  data,
  errors: null
});

describe('createAsyncState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('starts with the initial value and is not loading until load() runs', () => {
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string>(() => of(ok('value')), { initial: '' })
    );

    expect(state.data()).toBe('');
    expect(state.loading()).toBe(false);
    expect(state.error()).toBeNull();
  });

  it('unwraps ApiResponse data on a successful load', () => {
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string[]>(() => of(ok(['a', 'b'])))
    );

    expect(state.data()).toBeNull();

    state.load();

    expect(state.data()).toEqual(['a', 'b']);
    expect(state.loading()).toBe(false);
    expect(state.error()).toBeNull();
  });

  it('keeps the initial value when the API responds with null data', () => {
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string[]>(() => of(ok<string[]>(null as unknown as string[])), {
        initial: []
      })
    );

    state.load();

    expect(state.data()).toEqual([]);
  });

  it('surfaces a friendly error message when the request fails', () => {
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string>(
        () =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 500,
                statusText: 'Server Error',
                url: '/api/items',
                error: { message: 'Loading failed.' }
              })
          ),
        { errorFallback: 'Unable to load items.' }
      )
    );

    state.load();

    expect(state.error()).toBe('Loading failed.');
    expect(state.loading()).toBe(false);
    expect(state.data()).toBeNull();
  });

  it('falls back to the configured message for non-HTTP errors', () => {
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string>(() => throwError(() => new Error('boom')), {
        errorFallback: 'Unable to load items.'
      })
    );

    state.load();

    expect(state.error()).toBe('Unable to load items.');
  });

  it('clears a previous error on the next successful load', () => {
    let failing = true;
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string>(() =>
        failing ? throwError(() => new Error('first attempt')) : of(ok('recovered'))
      )
    );

    state.load();
    expect(state.error()).not.toBeNull();

    failing = false;
    state.load();

    expect(state.error()).toBeNull();
    expect(state.data()).toBe('recovered');
  });

  it('invokes onSuccess with the loaded data', () => {
    const onSuccess = vi.fn();
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string>(() => of(ok('value')), { onSuccess })
    );

    state.load();

    expect(onSuccess).toHaveBeenCalledWith('value');
  });

  it('runs the first load immediately when autoLoad is set', () => {
    const state = TestBed.runInInjectionContext(() =>
      createAsyncState<string>(() => of(ok('value')), { autoLoad: true })
    );

    expect(state.data()).toBe('value');
  });
});

describe('createAsyncState observable values', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('tracks loading synchronously while the request is in flight', () => {
    const pending = new Subject<ApiResponse<string>>();
    const state = TestBed.runInInjectionContext(() => createAsyncState<string>(() => pending));

    state.load();
    expect(state.loading()).toBe(true);

    pending.next(ok('done'));
    pending.complete();

    expect(state.loading()).toBe(false);
    expect(state.data()).toBe('done');
  });
});

describe('createRawAsyncState', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('stores the emitted value without unwrapping', () => {
    const state = TestBed.runInInjectionContext(() =>
      createRawAsyncState(() => of({ total: 3, items: ['a'] }), {
        initial: { total: 0, items: [] as string[] }
      })
    );

    state.load();

    expect(state.data()).toEqual({ total: 3, items: ['a'] });
    expect(state.error()).toBeNull();
  });

  it('supports composed streams such as forkJoin', () => {
    const state = TestBed.runInInjectionContext(() =>
      createRawAsyncState(() => forkJoin({ a: of(1), b: of('two') }), { initial: { a: 0, b: '' } })
    );

    state.load();

    expect(state.data()).toEqual({ a: 1, b: 'two' });
  });

  it('reports failures with the configured fallback', () => {
    const state = TestBed.runInInjectionContext(() =>
      createRawAsyncState(() => throwError(() => new Error('nope')), {
        errorFallback: 'Unable to load dashboard.'
      })
    );

    state.load();

    expect(state.error()).toBe('Unable to load dashboard.');
  });
});

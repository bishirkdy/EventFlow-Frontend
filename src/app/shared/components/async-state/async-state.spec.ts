import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncState } from './async-state';
import { provideComponentTestProviders } from '../../../testing/component-providers';

@Component({
  imports: [AsyncState],
  template: `
    <app-async-state
      [loading]="loading"
      [error]="error"
      [empty]="empty"
      [layout]="layout"
      [loadingView]="loadingView"
      [loadingLabel]="loadingLabel"
      [emptyTitle]="emptyTitle"
      [emptyActionLabel]="emptyActionLabel"
      (retry)="retries = retries + 1"
      (emptyAction)="emptyActions = emptyActions + 1"
    >
      <ng-template>
        <p class="projected-content">Loaded content</p>
      </ng-template>
    </app-async-state>
  `
})
class Host {
  loading = false;
  error: string | null = null;
  empty = false;
  layout: 'block' | 'inline' = 'block';
  loadingView: 'skeleton' | 'spinner' | 'text' = 'skeleton';
  loadingLabel = '';
  emptyTitle = 'Nothing here';
  emptyActionLabel = '';
  retries = 0;
  emptyActions = 0;
}

describe('AsyncState', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: provideComponentTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
  });

  it('shows a skeleton while loading by default', () => {
    host.loading = true;
    fixture.detectChanges();

    expect(el.querySelector('app-skeleton')).toBeTruthy();
    expect(el.querySelector('.projected-content')).toBeFalsy();
  });

  it('shows a spinner when loadingView is spinner', () => {
    host.loading = true;
    host.loadingView = 'spinner';
    fixture.detectChanges();

    expect(el.querySelector('app-loading')).toBeTruthy();
  });

  it('shows a text placeholder when loadingView is text', () => {
    host.loading = true;
    host.loadingView = 'text';
    host.loadingLabel = 'Loading sessions...';
    fixture.detectChanges();

    expect(el.textContent).toContain('Loading sessions...');
  });

  it('renders the error state with the message and fallback', () => {
    host.error = 'Boom';
    fixture.detectChanges();

    const state = el.querySelector('app-error-state');
    expect(state).toBeTruthy();
    expect((state as HTMLElement).textContent).toContain('Boom');
  });

  it('uses inline error layout when requested', () => {
    host.error = 'Boom';
    host.layout = 'inline';
    fixture.detectChanges();

    expect(el.querySelector('.border-red-500\\/30')).toBeTruthy();
  });

  it('emits retry from the error state', () => {
    host.error = 'Boom';
    fixture.detectChanges();

    const retry = el.querySelector<HTMLButtonElement>('app-error-state button');
    retry?.click();
    fixture.detectChanges();

    expect(host.retries).toBe(1);
  });

  it('renders the empty state with a call to action', () => {
    host.empty = true;
    host.emptyTitle = 'No sessions found';
    host.emptyActionLabel = 'Create Session';
    fixture.detectChanges();

    expect(el.textContent).toContain('No sessions found');

    const action = el.querySelector<HTMLButtonElement>('app-empty-state button');
    expect(action).toBeTruthy();
    action?.click();
    fixture.detectChanges();

    expect(host.emptyActions).toBe(1);
  });

  it('projects the content template once resolved', () => {
    fixture.detectChanges();

    expect(el.querySelector('.projected-content')?.textContent).toContain('Loaded content');
    expect(el.querySelector('app-skeleton')).toBeFalsy();
    expect(el.querySelector('app-error-state')).toBeFalsy();
  });
});

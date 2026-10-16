import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncState } from './async-state';

@Component({
  standalone: true,
  imports: [AsyncState],
  template: `
    <app-async-state
      [loading]="loading()"
      [error]="error()"
      [empty]="empty()"
      skeleton="cards"
      [skeletonCount]="2"
      emptyTitle="No items"
      emptyMessage="Create one to get started."
      (retry)="retry()"
    >
      <ng-template>
        <p class="content">Loaded content</p>
      </ng-template>
    </app-async-state>
  `,
})
class HostComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly empty = signal(false);
  retries = 0;

  retry(): void {
    this.retries += 1;
  }
}

describe('AsyncState', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the projected content when loaded', () => {
    expect(fixture.nativeElement.querySelector('.content')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeNull();
  });

  it('renders a skeleton while loading and hides the content', () => {
    host.loading.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();
  });

  it('renders the error state and emits retry', () => {
    host.error.set('Boom');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Boom');
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(host.retries).toBe(1);
  });

  it('renders the empty state', () => {
    host.empty.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No items');
    expect(fixture.nativeElement.querySelector('.content')).toBeNull();
  });
});

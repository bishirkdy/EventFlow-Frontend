import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBar } from './progress-bar';
import { LoadingService } from '../../../core/services/ui/loading.service';

describe('ProgressBar', () => {
  let fixture: ComponentFixture<ProgressBar>;
  let loading: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProgressBar] }).compileComponents();
    fixture = TestBed.createComponent(ProgressBar);
    loading = TestBed.inject(LoadingService);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays hidden while no request is in flight', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(fixture.nativeElement.querySelector('.progress-bar')).toBeNull();
  });

  it('appears after a request stays open past the delay and hides when it settles', () => {
    vi.useFakeTimers();

    loading.start();
    TestBed.flushEffects();
    expect(fixture.componentInstance.visible()).toBe(false);

    vi.advanceTimersByTime(200);
    expect(fixture.componentInstance.visible()).toBe(true);

    loading.stop();
    TestBed.flushEffects();
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('does not flash for fast requests', () => {
    vi.useFakeTimers();

    loading.start();
    TestBed.flushEffects();
    loading.stop();
    TestBed.flushEffects();
    vi.advanceTimersByTime(500);

    expect(fixture.componentInstance.visible()).toBe(false);
  });
});

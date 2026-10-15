import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorState } from './error-state';

describe('ErrorState', () => {
  let fixture: ComponentFixture<ErrorState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ErrorState] }).compileComponents();
    fixture = TestBed.createComponent(ErrorState);
    await fixture.whenStable();
  });

  it('renders the error message', () => {
    fixture.componentRef.setInput('message', 'Unable to load events.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to load events.');
  });

  it('hides the retry button unless requested', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits retry when the button is shown', async () => {
    fixture.componentRef.setInput('showRetry', true);
    fixture.detectChanges();

    const clicked = new Promise<void>((resolve) => fixture.componentInstance.retry.subscribe(resolve));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    await clicked;
    expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).textContent).toContain(
      'Try again',
    );
  });
});

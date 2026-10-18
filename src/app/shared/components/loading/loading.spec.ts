import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loading } from './loading';

describe('Loading', () => {
  let component: Loading;
  let fixture: ComponentFixture<Loading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loading]
    }).compileComponents();

    fixture = TestBed.createComponent(Loading);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing but the spinner without a label', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').classList).toContain('animate-spin');
    expect(fixture.nativeElement.textContent).not.toContain('Loading');
  });

  it('renders the label when provided', () => {
    fixture.componentRef.setInput('label', 'Loading events...');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading events...');
  });

  it('switches spinner size', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').className).toContain('h-10 w-10');
  });
});

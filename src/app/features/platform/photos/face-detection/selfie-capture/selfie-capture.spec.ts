import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelfieCapture } from './selfie-capture';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

describe('SelfieCapture', () => {
  let component: SelfieCapture;
  let fixture: ComponentFixture<SelfieCapture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelfieCapture],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            error: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelfieCapture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with camera off', () => {
    expect(component.showCamera()).toBe(false);
  });

  it('should not have face profile initially', () => {
    expect(component.hasFaceProfile()).toBe(false);
  });
});
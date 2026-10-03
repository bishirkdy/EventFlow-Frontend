import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotographerManagement } from './photographer-management';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'core/services/ui/notification.service';

describe('PhotographerManagement', () => {
  let component: PhotographerManagement;
  let fixture: ComponentFixture<PhotographerManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerManagement],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                paramMap: {
                  get: () => 'event-1'
                }
              }
            }
          }
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            error: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotographerManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty invitations array', () => {
    expect(component.invitations()).toEqual([]);
  });

  it('should validate email format', () => {
    const validator = (component as any).isValidEmail.bind(component);
    expect(validator('test@example.com')).toBe(true);
    expect(validator('invalid')).toBe(false);
    expect(validator('test@')).toBe(false);
  });
});

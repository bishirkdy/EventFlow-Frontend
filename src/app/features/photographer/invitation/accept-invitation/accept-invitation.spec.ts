import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcceptInvitation } from './accept-invitation';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';

describe('AcceptInvitation', () => {
  let component: AcceptInvitation;
  let fixture: ComponentFixture<AcceptInvitation>;

  const mockInvitation = {
    invitationId: '1',
    eventId: 'event-1',
    eventName: 'Test Event',
    email: 'test@example.com',
    roleName: 'Photographer',
    expiresAt: new Date().toISOString(),
    status: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptInvitation],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-token'
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

    fixture = TestBed.createComponent(AcceptInvitation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
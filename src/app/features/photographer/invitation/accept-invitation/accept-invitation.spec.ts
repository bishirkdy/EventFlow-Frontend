import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcceptInvitation } from './accept-invitation';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { InvitationType } from '../../../../core/models/invitation';

describe('AcceptInvitation', () => {
  let component: AcceptInvitation;
  let fixture: ComponentFixture<AcceptInvitation>;

  const mockInvitation = {
    invitationId: '1',
    eventId: 'event-1',
    eventName: 'Test Event',
    email: 'test@example.com',
    roleName: 'Photographer',
    type: InvitationType.Photographer,
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

  it('preserves the event photos page as returnUrl when switching accounts', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.invitation.set({ ...mockInvitation, status: 1 });
    component.goToLogin();

    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/photographer/event-1/photos',
        email: 'test@example.com',
      },
    });
  });

  it('goes to the event photos page after the invitation is accepted', () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.invitation.set({ ...mockInvitation, status: 1 });
    component.navigateToDashboard();

    expect(navigateByUrl).toHaveBeenCalledWith('/photographer/event-1/photos');
  });
});
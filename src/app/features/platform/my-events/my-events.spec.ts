import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MyEvents } from './my-events';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { EventService } from '../../../core/services/event/event.service';
import { EventRoleService } from '../../../core/services/event-role/event-role.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { RegistrationService } from '../../../core/services/registration/registration.service';
import { Event } from '../../../core/models/event';

describe('MyEvents', () => {
  let component: MyEvents;
  let fixture: ComponentFixture<MyEvents>;

  const roleService = { getMyRoles: vi.fn() };
  const eventService = { getMyEvents: vi.fn() };
  const registrationService = { getMine: vi.fn() };

  function makeEvent(status: 'Published' | 'Draft'): Event {
    return {
      id: 'evt-9',
      name: 'Test Event',
      description: 'A test event',
      eventType: 'Conference',
      status,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-01-02T00:00:00Z',
      images: []
    } as unknown as Event;
  }

  beforeEach(async () => {
    roleService.getMyRoles.mockReset().mockReturnValue(of({ data: [{ roleName: 'Participant' }] }));
    eventService.getMyEvents.mockReset().mockReturnValue(of({ data: [] }));
    registrationService.getMine.mockReset().mockReturnValue(of({ data: [] }));

    await TestBed.configureTestingModule({
      imports: [MyEvents],
      providers: [
        ...provideComponentTestProviders(),
        { provide: EventRoleService, useValue: roleService },
        { provide: EventService, useValue: eventService },
        { provide: RegistrationService, useValue: registrationService },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyEvents);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows the register shortcut on published cards the user can participate in', async () => {
    eventService.getMyEvents.mockReturnValue(of({ data: [makeEvent('Published')] }));
    fixture.detectChanges();
    await fixture.whenStable();

    const register = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === 'Register'
    );

    expect(register?.getAttribute('href')).toBe('/events/evt-9/register');
  });

  it('shows the feedback action once the user is registered', async () => {
    registrationService.getMine.mockReturnValue(of({ data: [{ id: 'reg-1' }] }));
    eventService.getMyEvents.mockReturnValue(of({ data: [makeEvent('Published')] }));
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('My Registration');
    expect(text).toContain('Feedback');
  });

  it('keeps participant shortcuts off draft cards', async () => {
    eventService.getMyEvents.mockReturnValue(of({ data: [makeEvent('Draft')] }));
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map(
      (anchor) => anchor.textContent?.trim()
    );
    expect(links).not.toContain('Register');
    expect(text).not.toContain('My Registration');
    expect(text).toContain('Open Event');
  });
});

describe('MyEvents openEvent role routing', () => {
  let component: MyEvents;
  let router: Router;

  const roleService = { getMyRoles: vi.fn() };
  const toastr = { success: vi.fn(), error: vi.fn() };
  const eventService = {
    getMyEvents: vi.fn(() => of({ data: [] })),
    publishEvent: vi.fn(() => of({}))
  };
  const testEvent = { id: 'evt-1' } as Event;

  function withRoles(...roleNames: string[]): void {
    roleService.getMyRoles.mockReturnValue(
      of({ data: roleNames.map((roleName) => ({ roleName })) })
    );
  }

  async function setup(): Promise<void> {
    roleService.getMyRoles.mockReset();
    toastr.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [MyEvents],
      providers: [
        ...provideComponentTestProviders(),
        { provide: EventRoleService, useValue: roleService },
        { provide: NotificationService, useValue: toastr },
        { provide: EventService, useValue: eventService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(MyEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  it('asks the role service for the event before navigating', async () => {
    await setup();
    withRoles('Owner');

    component.openEvent(testEvent);

    expect(roleService.getMyRoles).toHaveBeenCalledWith('evt-1');
    expect(router.navigate).toHaveBeenCalledWith(['/owner', 'evt-1']);
  });

  it('routes owners to the owner dashboard', async () => {
    await setup();
    withRoles('Owner');

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/owner', 'evt-1']);
  });

  it('routes attendance staff to the scanner workspace', async () => {
    await setup();
    withRoles('AttendanceStaff');

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/attendance-staff', 'evt-1']);
  });

  it('routes photographers to their photo workspace', async () => {
    await setup();
    withRoles('Photographer');

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/photographer', 'evt-1', 'photos']);
  });

  it('routes organizers to the organizer dashboard', async () => {
    await setup();
    withRoles('Organizer');

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/organizer', 'evt-1', 'overview']);
  });

  it('opens the public event site for participant-only memberships', async () => {
    await setup();
    withRoles('Participant');

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/events', 'evt-1']);
  });

  it('prefers the owner workspace when several roles are held', async () => {
    await setup();
    withRoles('Participant', 'Organizer', 'Owner');

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/owner', 'evt-1']);
  });

  it('opens the public event site when the account has no role on the event', async () => {
    await setup();
    withRoles();

    component.openEvent(testEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/events', 'evt-1']);
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it('stays put with a toast when the role lookup fails', async () => {
    await setup();
    roleService.getMyRoles.mockReturnValue(throwError(() => new Error('offline')));

    component.openEvent(testEvent);

    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });
});

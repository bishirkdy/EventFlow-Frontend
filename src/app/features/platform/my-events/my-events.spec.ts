import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MyEvents } from './my-events';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { EventService } from '../../../core/services/event/event.service';
import { EventRoleService } from '../../../core/services/event-role/event-role.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { Event } from '../../../core/models/event/event.model';

describe('MyEvents', () => {
  let component: MyEvents;
  let fixture: ComponentFixture<MyEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEvents],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(MyEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function makeEvent(status: 'Published' | 'Draft'): Event {
    return {
      id: 'evt-9',
      name: 'Test Event',
      description: 'A test event',
      eventType: 'Conference',
      status,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-01-02T00:00:00Z',
      images: [],
    } as unknown as Event;
  }

  it('shows register, certificate and feedback shortcuts on published cards', () => {
    component.events.set([makeEvent('Published')]);
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('a'),
    ).filter(anchor =>
      ['Register', 'Certificate', 'Feedback'].includes(anchor.textContent?.trim() ?? ''),
    );

    expect(links.map(anchor => anchor.getAttribute('href'))).toEqual([
      '/events/evt-9/register',
      '/events/evt-9/certificates',
      '/events/evt-9/feedback',
    ]);
  });

  it('keeps participant shortcuts off draft cards', () => {
    component.events.set([makeEvent('Draft')]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Certificate');
    expect(text).toContain('Publish Event');
  });
});

describe('MyEvents openEvent role routing', () => {
  let component: MyEvents;
  let router: Router;

  const roleService = { getMyRoles: vi.fn() };
  const toastr = { success: vi.fn(), error: vi.fn() };
  const eventService = {
    getMyEvents: vi.fn(() => of({ data: [] })),
    publishEvent: vi.fn(() => of({})),
  };
  const testEvent = { id: 'evt-1' } as Event;

  function withRoles(...roleNames: string[]): void {
    roleService.getMyRoles.mockReturnValue(
      of({ data: roleNames.map(roleName => ({ roleName })) }),
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
        { provide: EventService, useValue: eventService },
      ],
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

  it('stays put with a toast when the account has no role on the event', async () => {
    await setup();
    withRoles();

    component.openEvent(testEvent);

    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });

  it('stays put with a toast when the role lookup fails', async () => {
    await setup();
    roleService.getMyRoles.mockReturnValue(throwError(() => new Error('offline')));

    component.openEvent(testEvent);

    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledTimes(1);
  });
});

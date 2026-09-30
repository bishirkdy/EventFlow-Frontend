import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register';
import { RegistrationFormService } from '../../../../../../core/services/registration/registration-form.service';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { EventService } from '../../../../../../core/services/event/event.service';
import { ToastrService } from 'ngx-toastr';

const response = {
  isSuccess: true,
  statusCode: 200,
  message: 'Success',
  data: {
    id: 'form-1', eventId: 'event-1', name: 'Registration', description: null,
    isActive: true, capacityMode: 0, capacity: null, approvedCount: 0,
    waitlistCount: 0, enableWaitlist: false, opensAtUtc: null, closesAtUtc: null, fields: [],
  },
  errors: null,
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'event-1' } } },
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: RegistrationFormService, useValue: { get: () => of(response) } },
        { provide: RegistrationService, useValue: { create: () => of(response) } },
        { provide: EventService, useValue: { getEventById: () => of({ ...response, data: null }) } },
        { provide: ToastrService, useValue: { success: jasmine.createSpy(), error: jasmine.createSpy() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

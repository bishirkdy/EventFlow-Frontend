import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationFormComponent } from './registration-form';
import { CapacityMode } from '../../../../../core/models/registration/registration.enums';

const form = {
  id: 'form-1',
  eventId: 'event-1',
  name: 'Event Registration',
  description: 'Register for the event.',
  isActive: true,
  capacityMode: CapacityMode.Unlimited,
  capacity: null,
  approvedCount: 0,
  waitlistCount: 0,
  enableWaitlist: false,
  opensAtUtc: null,
  closesAtUtc: null,
  fields: [],
};

describe('RegistrationFormComponent', () => {
  let component: RegistrationFormComponent;
  let fixture: ComponentFixture<RegistrationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('registrationForm', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

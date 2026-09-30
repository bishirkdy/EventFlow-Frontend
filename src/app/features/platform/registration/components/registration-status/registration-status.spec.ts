import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationStatusComponent } from './registration-status';
import { RegistrationStatus } from '../../../../../core/models/registration/registration.enums';

describe('RegistrationStatusComponent', () => {
  let component: RegistrationStatusComponent;
  let fixture: ComponentFixture<RegistrationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationStatusComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', RegistrationStatus.Pending);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { RegistrationFieldComponent } from './registration-field';
import { RegistrationFieldType } from '../../../../../core/models/registration/registration.enums';

const field = {
  id: 'field-1',
  fieldKey: 'company',
  label: 'Company',
  fieldType: RegistrationFieldType.Text,
  isRequired: false,
  displayOrder: 1,
  optionsJson: null,
  validationJson: null,
};

describe('RegistrationFieldComponent', () => {
  let component: RegistrationFieldComponent;
  let fixture: ComponentFixture<RegistrationFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

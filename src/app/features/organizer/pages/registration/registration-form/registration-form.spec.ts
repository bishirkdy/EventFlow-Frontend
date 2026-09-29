import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationFormPageComponent } from './registration-form';

describe('RegistrationFormPageComponent', () => {
  let component: RegistrationFormPageComponent;
  let fixture: ComponentFixture<RegistrationFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationFormPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

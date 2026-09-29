import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationFieldComponent } from './registration-field';

describe('RegistrationFieldComponent', () => {
  let component: RegistrationFieldComponent;
  let fixture: ComponentFixture<RegistrationFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

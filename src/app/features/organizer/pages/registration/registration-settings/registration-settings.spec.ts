import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationSettingsComponent } from './registration-settings';

describe('RegistrationSettingsComponent', () => {
  let component: RegistrationSettingsComponent;
  let fixture: ComponentFixture<RegistrationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

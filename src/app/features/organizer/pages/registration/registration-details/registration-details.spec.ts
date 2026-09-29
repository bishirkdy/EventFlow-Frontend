import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationDetailsComponent } from './registration-details';

describe('RegistrationDetailsComponent', () => {
  let component: RegistrationDetailsComponent;
  let fixture: ComponentFixture<RegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

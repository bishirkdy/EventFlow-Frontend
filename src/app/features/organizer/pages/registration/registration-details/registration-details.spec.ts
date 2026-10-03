import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationDetailsComponent } from './registration-details';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('RegistrationDetailsComponent', () => {
  let component: RegistrationDetailsComponent;
  let fixture: ComponentFixture<RegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationDetailsComponent],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

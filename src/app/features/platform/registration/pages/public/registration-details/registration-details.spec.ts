import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicRegistrationDetailsComponent } from './registration-details';

describe('PublicRegistrationDetailsComponent', () => {
  let component: PublicRegistrationDetailsComponent;
  let fixture: ComponentFixture<PublicRegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicRegistrationDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicRegistrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

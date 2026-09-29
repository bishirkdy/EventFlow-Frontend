import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationsComponent } from './registrations';

describe('RegistrationsComponent', () => {
  let component: RegistrationsComponent;
  let fixture: ComponentFixture<RegistrationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

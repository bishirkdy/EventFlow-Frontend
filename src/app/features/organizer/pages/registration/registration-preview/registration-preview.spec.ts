import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationPreviewComponent } from './registration-preview';

describe('RegistrationPreviewComponent', () => {
  let component: RegistrationPreviewComponent;
  let fixture: ComponentFixture<RegistrationPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

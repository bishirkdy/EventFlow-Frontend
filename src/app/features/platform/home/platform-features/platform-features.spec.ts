import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformFeatures } from './platform-features';



describe('PlatformFeatures', () => {
  let component: PlatformFeatures;
  let fixture: ComponentFixture<PlatformFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformFeatures],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformFeatures);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

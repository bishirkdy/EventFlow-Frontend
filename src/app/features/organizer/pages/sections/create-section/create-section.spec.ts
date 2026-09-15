import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSection } from './create-section';

describe('CreateSection', () => {
  let component: CreateSection;
  let fixture: ComponentFixture<CreateSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSection],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

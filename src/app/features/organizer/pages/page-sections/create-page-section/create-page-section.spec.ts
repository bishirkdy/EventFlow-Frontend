import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePageSection } from './create-page-section';

describe('CreatePageSection', () => {
  let component: CreatePageSection;
  let fixture: ComponentFixture<CreatePageSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePageSection],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePageSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

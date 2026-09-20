import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSection } from './update-section';

describe('UpdateSection', () => {
  let component: UpdateSection;
  let fixture: ComponentFixture<UpdateSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSection],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

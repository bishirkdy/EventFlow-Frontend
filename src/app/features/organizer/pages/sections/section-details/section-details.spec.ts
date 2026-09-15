import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDetails } from './section-details';

describe('SectionDetails', () => {
  let component: SectionDetails;
  let fixture: ComponentFixture<SectionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

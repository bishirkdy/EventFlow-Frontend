import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSections } from './page-sections';

describe('PageSections', () => {
  let component: PageSections;
  let fixture: ComponentFixture<PageSections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSections],
    }).compileComponents();

    fixture = TestBed.createComponent(PageSections);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

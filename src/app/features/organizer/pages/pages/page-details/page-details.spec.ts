import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDetails } from './page-details';

describe('PageDetails', () => {
  let component: PageDetails;
  let fixture: ComponentFixture<PageDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

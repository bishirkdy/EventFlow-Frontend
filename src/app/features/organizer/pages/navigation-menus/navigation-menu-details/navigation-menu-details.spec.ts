import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationMenuDetails } from './navigation-menu-details';

describe('NavigationMenuDetails', () => {
  let component: NavigationMenuDetails;
  let fixture: ComponentFixture<NavigationMenuDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationMenuDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationMenuDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

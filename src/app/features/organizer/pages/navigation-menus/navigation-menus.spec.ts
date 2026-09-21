import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationMenus } from './navigation-menus';

describe('NavigationMenus', () => {
  let component: NavigationMenus;
  let fixture: ComponentFixture<NavigationMenus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationMenus],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationMenus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

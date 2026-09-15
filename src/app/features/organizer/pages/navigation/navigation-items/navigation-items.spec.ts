import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationItems } from './navigation-items';

describe('NavigationItems', () => {
  let component: NavigationItems;
  let fixture: ComponentFixture<NavigationItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationItems],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

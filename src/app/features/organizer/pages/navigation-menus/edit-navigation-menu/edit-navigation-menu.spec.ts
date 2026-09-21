import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNavigationMenu } from './edit-navigation-menu';

describe('EditNavigationMenu', () => {
  let component: EditNavigationMenu;
  let fixture: ComponentFixture<EditNavigationMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNavigationMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(EditNavigationMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

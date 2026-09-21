import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNavigationItem } from './edit-navigation-item';

describe('EditNavigationItem', () => {
  let component: EditNavigationItem;
  let fixture: ComponentFixture<EditNavigationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNavigationItem],
    }).compileComponents();

    fixture = TestBed.createComponent(EditNavigationItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

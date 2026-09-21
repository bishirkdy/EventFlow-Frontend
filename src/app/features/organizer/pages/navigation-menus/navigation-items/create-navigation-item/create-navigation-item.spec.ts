import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNavigationItem } from './create-navigation-item';

describe('CreateNavigationItem', () => {
  let component: CreateNavigationItem;
  let fixture: ComponentFixture<CreateNavigationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNavigationItem],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateNavigationItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

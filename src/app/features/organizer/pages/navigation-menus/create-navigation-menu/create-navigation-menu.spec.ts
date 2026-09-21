import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNavigationMenu } from './create-navigation-menu';

describe('CreateNavigationMenu', () => {
  let component: CreateNavigationMenu;
  let fixture: ComponentFixture<CreateNavigationMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNavigationMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateNavigationMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

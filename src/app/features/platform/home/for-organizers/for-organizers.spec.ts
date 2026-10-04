import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ForOrganizers } from './for-organizers';

describe('ForOrganizers', () => {
  let component: ForOrganizers;
  let fixture: ComponentFixture<ForOrganizers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [ForOrganizers],
    }).compileComponents();

    fixture = TestBed.createComponent(ForOrganizers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

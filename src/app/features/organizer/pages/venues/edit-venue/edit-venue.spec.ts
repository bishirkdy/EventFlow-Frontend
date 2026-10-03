import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVenue } from './edit-venue';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('EditVenue', () => {
  let component: EditVenue;
  let fixture: ComponentFixture<EditVenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVenue],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(EditVenue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

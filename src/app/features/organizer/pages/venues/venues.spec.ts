import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Venues } from './venues';
import { provideComponentTestProviders } from '../../../../testing/component-providers';

describe('Venues', () => {
  let component: Venues;
  let fixture: ComponentFixture<Venues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Venues],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Venues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

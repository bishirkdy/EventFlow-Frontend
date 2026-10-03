import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Preview } from './preview';
import { provideComponentTestProviders } from '../../../../testing/component-providers';

describe('Preview', () => {
  let component: Preview;
  let fixture: ComponentFixture<Preview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preview],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Preview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

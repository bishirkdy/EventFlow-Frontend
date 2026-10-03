import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSection } from './update-section';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('UpdateSection', () => {
  let component: UpdateSection;
  let fixture: ComponentFixture<UpdateSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSection],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

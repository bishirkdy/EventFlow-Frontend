import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEvents } from './my-events';
import { provideComponentTestProviders } from '../../../testing/component-providers';

describe('MyEvents', () => {
  let component: MyEvents;
  let fixture: ComponentFixture<MyEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEvents],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(MyEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSession } from './update-session';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('UpdateSession', () => {
  let component: UpdateSession;
  let fixture: ComponentFixture<UpdateSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSession],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateSession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

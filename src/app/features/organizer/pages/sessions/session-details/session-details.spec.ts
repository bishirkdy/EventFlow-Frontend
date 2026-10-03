import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDetails } from './session-details';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('SessionDetails', () => {
  let component: SessionDetails;
  let fixture: ComponentFixture<SessionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDetails],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

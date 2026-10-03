import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPage } from './edit-page';
import { provideComponentTestProviders } from '../../../../../testing/component-providers';

describe('EditPage', () => {
  let component: EditPage;
  let fixture: ComponentFixture<EditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPage],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(EditPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { Preview } from './preview';
import { provideComponentTestProviders } from '../../../../testing/component-providers';

describe('Preview', () => {
  let component: Preview;
  let fixture: ComponentFixture<Preview>;
  const navigate = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preview],
      providers: [
        ...provideComponentTestProviders(),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                paramMap: {
                  get: (key: string) => (key === 'eventId' ? 'event-1' : null),
                },
              },
            },
          },
        },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Preview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the event website in preview mode', () => {
    expect(navigate).toHaveBeenCalledWith(['/events', 'event-1'], {
      queryParams: { preview: '1' },
    });
  });
});

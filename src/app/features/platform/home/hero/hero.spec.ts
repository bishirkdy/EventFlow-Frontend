import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideComponentTestProviders } from '../../../../testing/component-providers';
import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideComponentTestProviders()],
      imports: [Hero]
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock
      .expectOne((request) => request.url.endsWith('/v1/events/public?take=1'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: [],
        errors: null
      });

    httpMock
      .expectOne((request) => request.url.endsWith('/v1/events/public/stats'))
      .flush({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: { publishedEvents: 4, participants: 18 },
        errors: null
      });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the real platform counts', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('4');
    expect(text).toContain('18');
  });
});

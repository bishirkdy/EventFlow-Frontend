import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPhotos } from './my-photos';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

describe('MyPhotos', () => {
  let component: MyPhotos;
  let fixture: ComponentFixture<MyPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPhotos],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'event-1'
              }
            }
          }
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            error: vi.fn(),
            info: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyPhotos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty photos array', () => {
    expect(component.allPhotos()).toEqual([]);
  });

  it('should not have face profile initially', () => {
    expect(component.hasFaceProfile()).toBe(false);
  });
});
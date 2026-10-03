import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoGallery } from './photo-gallery';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

describe('PhotoGallery', () => {
  let component: PhotoGallery;
  let fixture: ComponentFixture<PhotoGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoGallery],
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
            error: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoGallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty photos array', () => {
    expect(component.photos()).toEqual([]);
  });

  it('should have default page size of 24', () => {
    expect(component.pageSize()).toBe(24);
  });
});
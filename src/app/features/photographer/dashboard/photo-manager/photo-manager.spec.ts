import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoManager } from './photo-manager';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

describe('PhotoManager', () => {
  let component: PhotoManager;
  let fixture: ComponentFixture<PhotoManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoManager],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                paramMap: {
                  get: () => 'event-1'
                }
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

    fixture = TestBed.createComponent(PhotoManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty photos array', () => {
    expect(component.photos()).toEqual([]);
  });

  it('should have default page size of 20', () => {
    expect(component.pageSize()).toBe(20);
  });
});
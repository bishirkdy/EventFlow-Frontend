import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoUpload } from './photo-upload';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

describe('PhotoUpload', () => {
  let component: PhotoUpload;
  let fixture: ComponentFixture<PhotoUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoUpload],
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

    fixture = TestBed.createComponent(PhotoUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty photos array', () => {
    expect(component.photos()).toEqual([]);
  });

  it('should format file sizes correctly', () => {
    expect(component.formatFileSize(500)).toBe('500 B');
    expect(component.formatFileSize(1500)).toBe('1.5 KB');
    expect(component.formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});
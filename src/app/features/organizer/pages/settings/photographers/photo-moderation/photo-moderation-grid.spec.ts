import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoModerationGrid } from './photo-moderation-grid';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'core/services/ui/notification.service';

describe('PhotoModerationGrid', () => {
  let component: PhotoModerationGrid;
  let fixture: ComponentFixture<PhotoModerationGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoModerationGrid],
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

    fixture = TestBed.createComponent(PhotoModerationGrid);
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

  it('should have default filter status of all', () => {
    expect(component.filterStatus()).toBe('all');
  });
});

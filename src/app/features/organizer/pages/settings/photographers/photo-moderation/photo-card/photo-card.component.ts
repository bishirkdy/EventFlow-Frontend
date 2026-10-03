import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Photo {
  photoId: string;
  eventId: string;
  photographerId: string;
  photographerEmail?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isVisible: boolean;
  uploadedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group aspect-square overflow-hidden rounded-xl border border-border bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer" (click)="open.emit(photo())">
      <img [src]="photo().imageUrl" [alt]="'Photo ' + photo().photoId" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
      <span class="absolute top-2 right-2 px-2 py-1 text-xs rounded-lg font-medium" [ngClass]="photo().isVisible ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'">
        {{ photo().isVisible ? 'Approved' : 'Pending' }}
      </span>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
          <span class="text-white text-xs truncate">{{ photo().uploadedAt | date: 'medium' }}</span>
          <div class="flex justify-between">
            <button type="button" (click)="$event.stopPropagation(); toggleVisibility.emit(photo())" [disabled]="loading()" class="px-2 py-1 text-xs rounded-lg font-medium transition-colors" [ngClass]="photo().isVisible ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'">
              {{ photo().isVisible ? 'Hide' : 'Approve' }}
            </button>
            <button type="button" (click)="$event.stopPropagation(); deletePhoto.emit(photo())" [disabled]="loading()" class="px-2 py-1 text-xs rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PhotoCardComponent {
  photo = input.required<Photo>();
  loading = input(false);
  open = output<Photo>();
  toggleVisibility = output<Photo>();
  deletePhoto = output<Photo>();
}

import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

@Component({
  selector: 'app-website-header',
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: './website-header.html',
  styleUrl: './website-header.css',
})

export class WebsiteHeader {
  readonly data = input.required<EventWebsiteData>();
  readonly templateLabel = input('Event');
}

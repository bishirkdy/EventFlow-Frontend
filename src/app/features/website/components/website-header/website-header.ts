import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website';

@Component({
  selector: 'app-website-header',
  standalone: true,
  templateUrl: './website-header.html',
  styleUrl: './website-header.css',
})

export class WebsiteHeader {
  readonly data = input.required<EventWebsiteData>();
  readonly templateLabel = input('Event');
}

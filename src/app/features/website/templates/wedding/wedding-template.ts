import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../models/event-website-data.model';

@Component({
  selector: 'app-wedding-template',
  standalone: true,
  templateUrl: './wedding-template.html',
  styleUrl: './wedding-template.css',
})
export class WeddingTemplate {
  readonly data = input.required<EventWebsiteData>();
}

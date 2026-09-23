import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-sports-template',
  standalone: true,
  templateUrl: './sports-template.html',
  styleUrl: './sports-template.css',
})
export class SportsTemplate {
  readonly data = input.required<EventWebsiteData>();
}

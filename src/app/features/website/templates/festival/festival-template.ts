import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-festival-template',
  standalone: true,
  templateUrl: './festival-template.html',
  styleUrl: './festival-template.css',
})
export class FestivalTemplate {
  readonly data = input.required<EventWebsiteData>();
}

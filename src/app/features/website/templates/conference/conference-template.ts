import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-conference-template',
  standalone: true,
  templateUrl: './conference-template.html',
  styleUrl: './conference-template.css',
})
export class ConferenceTemplate {
  readonly data = input.required<EventWebsiteData>();
}

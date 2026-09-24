import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventWebsiteShell } from '../../components/event-website-shell/event-website-shell';

@Component({
  selector: 'app-conference-template',
  standalone: true,
  imports: [EventWebsiteShell],
  templateUrl: './conference-template.html',
  styleUrl: './conference-template.css',
})
export class ConferenceTemplate {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
}

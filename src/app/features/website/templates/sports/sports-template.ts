import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventWebsiteShell } from '../../components/event-website-shell/event-website-shell';

@Component({
  selector: 'app-sports-template',
  standalone: true,
  imports: [EventWebsiteShell],
  templateUrl: './sports-template.html',
  styleUrl: './sports-template.css',
})
export class SportsTemplate {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
}

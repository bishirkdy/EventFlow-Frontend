import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventWebsiteShell } from '../../components/event-website-shell/event-website-shell';

@Component({
  selector: 'app-festival-template',
  standalone: true,
  imports: [EventWebsiteShell],
  templateUrl: './festival-template.html',
  styleUrl: './festival-template.css',
})
export class FestivalTemplate {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
}

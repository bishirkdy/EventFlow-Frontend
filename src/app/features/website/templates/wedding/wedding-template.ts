import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventWebsiteShell } from '../../components/event-website-shell/event-website-shell';

@Component({
  selector: 'app-wedding-template',
  standalone: true,
  imports: [EventWebsiteShell],
  templateUrl: './wedding-template.html',
  styleUrl: './wedding-template.css',
})
export class WeddingTemplate {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
}

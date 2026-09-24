import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventWebsiteShell } from '../event-website-shell/event-website-shell';

@Component({
  selector: 'app-website-template-selector',
  standalone: true,
  imports: [EventWebsiteShell],
  templateUrl: './website-template-selector.html',
  styleUrl: './website-template-selector.css',
})
export class WebsiteTemplateSelector {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
}

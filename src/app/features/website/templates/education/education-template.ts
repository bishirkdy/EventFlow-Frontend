import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventWebsiteShell } from '../../components/event-website-shell/event-website-shell';

@Component({
  selector: 'app-education-template',
  standalone: true,
  imports: [EventWebsiteShell],
  templateUrl: './education-template.html',
  styleUrl: './education-template.css',
})
export class EducationTemplate {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
}

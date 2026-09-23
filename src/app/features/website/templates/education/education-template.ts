import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-education-template',
  standalone: true,
  templateUrl: './education-template.html',
  styleUrl: './education-template.css',
})
export class EducationTemplate {
  readonly data = input.required<EventWebsiteData>();
}

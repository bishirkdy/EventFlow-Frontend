import { Component, computed, input } from '@angular/core';


import { WeddingTemplate } from '../../templates/wedding/wedding-template';
import { ConferenceTemplate } from '../../templates/conference/conference-template';
import { FestivalTemplate } from '../../templates/festival/festival-template';
import { EducationTemplate } from '../../templates/education/education-template';
import { SportsTemplate } from '../../templates/sports/sports-template';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

type WebsiteTemplate =
  | 'Wedding'
  | 'Conference'
  | 'Festival'
  | 'Education'
  | 'Sports';

@Component({
  selector: 'app-website-template-selector',
  standalone: true,
  imports: [
    WeddingTemplate,
    ConferenceTemplate,
    FestivalTemplate,
    EducationTemplate,
    SportsTemplate,
  ],
  templateUrl: './website-template-selector.html',
  styleUrl: './website-template-selector.css',
})
export class WebsiteTemplateSelector {
  readonly data = input.required<EventWebsiteData>();

  readonly templateType = computed<WebsiteTemplate>(() => {
    const eventType = this.data().event?.eventType?.trim().toLowerCase();

    switch (eventType) {
      case 'conference':
        return 'Conference';
      case 'festival':
        return 'Festival';
      case 'education':
        return 'Education';
      case 'sports':
        return 'Sports';
      case 'wedding':
      default:
        return 'Wedding';
    }
  });
}

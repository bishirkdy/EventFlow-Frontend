import { Component, computed, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { ConferenceTemplate } from '../../templates/conference/conference-template';
import { EducationTemplate } from '../../templates/education/education-template';
import { FestivalTemplate } from '../../templates/festival/festival-template';
import { SportsTemplate } from '../../templates/sports/sports-template';
import { WeddingTemplate } from '../../templates/wedding/wedding-template';
@Component({
  selector: 'app-website-template-selector',
  standalone: true,
  imports: [
    ConferenceTemplate,
    EducationTemplate,
    FestivalTemplate,
    SportsTemplate,
    WeddingTemplate,
  ],
  templateUrl: './website-template-selector.html',
  styleUrl: './website-template-selector.css',
})
export class WebsiteTemplateSelector {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
  readonly preview = input(false);
  readonly type = computed(() => {
    const eventType: string | undefined = this.data().event?.eventType;
    const typeValue = eventType ? eventType.trim() : '';
    const value = typeValue.toLowerCase();
    if (value.includes('conference')) return 'conference';
    if (value.includes('education') || value.includes('workshop')) return 'education';
    if (value.includes('festival') || value.includes('cultural')) return 'festival';
    if (value.includes('sports') || value.includes('competition')) return 'sports';
    if (value.includes('wedding') || value.includes('marriage')) return 'wedding';
    if (value.includes('symposium') || value.includes('summit')) return 'conference';
    if (value.includes('party') || value.includes('celebration')) return 'festival';
    return 'wedding';
  });
}

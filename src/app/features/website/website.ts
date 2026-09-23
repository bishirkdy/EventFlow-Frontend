import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventWebsiteService } from '../../core/services/website/event-website.service';
import { EventWebsiteData } from './models/event-website-data.model';
import { WeddingTemplate } from './templates/wedding/wedding-template';
import { ConferenceTemplate } from './templates/conference/conference-template';
import { FestivalTemplate } from './templates/festival/festival-template';
import { EducationTemplate } from './templates/education/education-template';
import { SportsTemplate } from './templates/sports/sports-template';

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [WeddingTemplate, ConferenceTemplate, FestivalTemplate, EducationTemplate, SportsTemplate],
  templateUrl: './website.html',
  styleUrl: './website.css',
})
export class Website implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly websiteService = inject(EventWebsiteService);

  readonly data = signal<EventWebsiteData | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (!eventId) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.websiteService.load(eventId).subscribe({
      next: data => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load event website:', error);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}

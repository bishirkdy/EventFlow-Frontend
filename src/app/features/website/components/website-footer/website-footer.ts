import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-website-footer',
  standalone: true,
  templateUrl: './website-footer.html',
  styleUrl: './website-footer.css',
})
export class WebsiteFooter {
  readonly data = input.required<EventWebsiteData>();
}

import { Component, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

@Component({
  selector: 'app-website-footer',
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: './website-footer.html',
  styleUrl: './website-footer.css'
})
export class WebsiteFooter {
  readonly data = input.required<EventWebsiteData>();
}

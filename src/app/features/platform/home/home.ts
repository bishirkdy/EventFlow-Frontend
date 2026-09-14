import { Component, inject } from '@angular/core';
import { Hero } from "./hero/hero";
import { EventJourney } from "./event-journey/event-journey";
import { PlatformFeatures } from './platform-features/platform-features';
import { UpcomingEvents } from "./upcoming-events/upcoming-events";
import { ForOrganizers } from './for-organizers/for-organizers';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [Hero, EventJourney, PlatformFeatures, UpcomingEvents, ForOrganizers],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
    private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}

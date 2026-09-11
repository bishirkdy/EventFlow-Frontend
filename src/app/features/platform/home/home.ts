import { Component } from '@angular/core';
import { Hero } from "./hero/hero";
import { EventJourney } from "./event-journey/event-journey";
import { PlatformFeatures } from './platform-features/platform-features';
import { UpcomingEvents } from "./upcoming-events/upcoming-events";
import { ForOrganizers } from './for-organizers/for-organizers';
import { HomeCta } from "./home-cta/home-cta";

@Component({
  selector: 'app-home',
  imports: [Hero, EventJourney, PlatformFeatures, UpcomingEvents, ForOrganizers],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

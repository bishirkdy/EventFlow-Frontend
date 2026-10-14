import { Event } from '../event/event.model';
import { EventFeatureModel } from '../event-feature/event-feature.model';
import { EventPageModel } from '../event-page/event-page.model';
import { NavigationItemModel } from '../navigation-item/navigation-item.model';
import { PageSectionModel } from '../event-page-section/page-section.model';
import { SessionModel } from '../session/session.model';
import { SpeakerModel } from '../speaker/speaker.model';
import { SponsorModel } from '../sponsor/sponsor.model';
import { VenueModel } from '../venue/venue.model';

export interface EventWebsiteData {
  event: Event | null;
  images: Event['images'];
  features: EventFeatureModel[];
  pages: EventPageModel[];
  pageSections: PageSectionModel[];
  sessions: SessionModel[];
  venues: VenueModel[];
  speakers: SpeakerModel[];
  sponsors: SponsorModel[];
  navigationItems: NavigationItemModel[];
}

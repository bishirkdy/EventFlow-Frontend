import { Event as EventModel } from '../../../core/models/event/event.model';
import { EventFeatureModel } from '../../../core/models/event-feature/event-feature.model';
import { EventPageModel } from '../../../core/models/event-page/event-page.model';
import { SectionModel } from '../../../core/models/section/section.model';
import { SessionModel } from '../../../core/models/session/session.model';
import { VenueModel } from '../../../core/models/venue/venue.model';
import { NavigationMenuModel } from '../../../core/models/navigation-menu/navigation-menu.model';
import { NavigationItemModel } from '../../../core/models/navigation-item/navigation-item.model';
import { PageSectionModel } from '../../../core/models/event-page-section/PageSectionModel';
import { SpeakerModel } from '../../../core/models/speaker/speaker.model';
import { SponsorModel } from '../../../core/models/sponsor/sponsor.model';

export interface EventWebsiteData {
  event: EventModel | null;
  images: EventModel['images'];
  features: EventFeatureModel[];
  pages: EventPageModel[];
  pageSections: PageSectionModel[];
  sections: SectionModel[];
  sessions: SessionModel[];
  venues: VenueModel[];
  speakers: SpeakerModel[];
  sponsors: SponsorModel[];
  navigationMenus: NavigationMenuModel[];
  navigationItems: NavigationItemModel[];
}
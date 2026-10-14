import { KeyCountModel } from './key-count.model';
import { PageSectionCountModel } from './page-section-count.model';

export interface ContentAnalyticsModel {
  eventId: string;
  pagesTotal: number;
  pagesPublished: number;
  pagesDraft: number;
  pageSectionsTotal: number;
  pageSectionsVisible: number;
  sectionsByPage: PageSectionCountModel[];
  sectionsByType: KeyCountModel[];
  navigationItemsTotal: number;
  navigationItemsVisible: number;
  photosTotal: number;
  photosVisible: number;
  photosPendingApproval: number;
  featuresTotal: number;
  featuresEnabled: number;
  enabledFeatureNames: string[];
}

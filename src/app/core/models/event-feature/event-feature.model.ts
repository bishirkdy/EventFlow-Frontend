export interface EventFeatureModel {
  id: string;
  eventId: string;
  featureId: string;
  featureCode: string;
  featureName: string;
  featureDescription: string | null;
  isEnabled: boolean;
}
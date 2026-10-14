import { SpeakerModel } from './speaker.model';
import { SpeakerSessionModel } from './speaker-session.model';

export interface SpeakerDetailsModel extends SpeakerModel {
  sessions: SpeakerSessionModel[];
}

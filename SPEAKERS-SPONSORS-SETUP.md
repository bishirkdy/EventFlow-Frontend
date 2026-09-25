# Speakers & Sponsors setup

## Feature availability
- Conference: Speakers + Sponsors
- Festival: Sponsors
- Wedding: neither
- Education: neither
- Sports: neither

The backend prevents enabling Speakers/Sponsors for an unsupported event type. The organizer sidebar and routes also hide/block unavailable features.

## Images
Speaker portraits and sponsor logos are uploaded as files through the existing Cloudinary `IFileStorage` pipeline. URLs are persisted in the Event service database.

## Public website
The website loads Speakers/Sponsors only when the corresponding event feature is enabled. Conference/Festival pages render their real records rather than placeholder text.

## Backend migration
After replacing the backend source, run:

```bash
dotnet ef database update --project src/Services/Event/EventFlow.Event.Infrastructure --startup-project src/Services/Event/EventFlow.Event.Api
```

Migration: `20260925100000_AddSpeakersSponsors`.

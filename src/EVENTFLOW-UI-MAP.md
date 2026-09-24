# EventFlow UI map

This file is the quick reference for where event website and organizer behavior should be changed.

## Event workspace

- `app/features/platform/my-events/` — event list and entry point into an event workspace.
- `app/features/organizer/layout/organizer-layout/` — event-scoped shell, sidebar, event loading and feature-driven navigation.
- `app/features/organizer/services/organizer-event-state.service.ts` — current event and feature state shared by organizer pages.
- `app/features/organizer/config/organizer-navigation.ts` — only routes that actually exist in the organizer are listed here.

## Event management

- `app/features/organizer/pages/event-details/` — event information.
- `app/features/organizer/pages/features/` — event feature enable/disable/reset.
- `app/features/organizer/pages/venues/` — venue CRUD.
- `app/features/organizer/pages/sections/` — event section CRUD.
- `app/features/organizer/pages/sessions/` — session CRUD.

## Website CMS

### Pages

`app/features/organizer/pages/pages/`

- Page record: name, slug, page type, display order, published state.
- Page editor: `create-page/`, `edit-page/`.
- Page details: `page-details/`.
- Preview action routes to the website template.

### Page sections

`app/features/organizer/pages/page-sections/`

- A page contains ordered sections.
- Supported first-class section types are defined in:
  `app/core/constants/website-content.constants.ts`.
- Section images are uploaded through the existing backend API.
- Configuration must be valid JSON when supplied.
- Up/down controls persist section order through the existing reorder API.

### Navigation

`app/features/organizer/pages/navigation-menus/`

- Navigation menu = a menu definition and location.
- Navigation item = page target or URL.
- Page targets are selected from published event pages.
- Up/down controls persist navigation order.
- Visibility is updated through the existing visibility endpoint.

## Public/preview website

`app/features/website/`

- `website.ts` — loads the event website data for the current event/page route.
- `components/website-template-selector/` — chooses the template from the event type.
- `components/website-header/` — event identity and date.
- `components/website-navigation/` — navigation menu and page routing.
- `components/page-section-renderer/` — renders CMS page sections.
- `components/website-footer/` — shared footer.
- `templates/wedding/` — Wedding visual template.
- `templates/conference/` — Conference visual template.
- `templates/education/` — Education visual template.
- `templates/festival/` — Festival visual template.
- `templates/sports/` — Sports visual template.
- `core/services/website/event-website.service.ts` — combines event, pages, sections, sessions, venues, images and navigation into one website data object.

## Important data flow

```text
Event
  |
  +-- EventImages ----------------------> Gallery
  |
  +-- EventPages
  |     |
  |     +-- PageSections ----------------> Page content
  |
  +-- Sections
  |     |
  |     +-- Sessions --------------------> Schedule
  |
  +-- Venues ----------------------------> Venue
  |
  +-- NavigationMenus
        |
        +-- NavigationItems -------------> Website header navigation
```

## Feature rule

`EventTypeFeature` determines which features apply to an event.
`EventFeature` determines which applicable features are enabled.
The organizer sidebar reacts to the shared `OrganizerEventStateService` feature state immediately after a toggle.

## Settings

Event Settings was removed from the organizer UI because the current feature-toggle behavior belongs to Event Features and there is no separate event configuration requirement being used by the frontend.

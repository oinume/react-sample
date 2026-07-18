# Navigation Learning App Design

## Goal

Replace the Expo starter screens with a small bookmark application that demonstrates practical Expo Router navigation patterns. The app is for learning navigation, so it uses local sample data and does not include authentication, backend APIs, or persistent storage.

## Navigation architecture

The application uses a root Stack with a nested Drawer and route-based form sheets.

```text
app/
├── _layout.tsx                 Root Stack and providers
├── (drawer)/
│   ├── _layout.tsx            Drawer Navigator and custom drawer content
│   └── index.tsx              Home bookmark list
├── tags/
│   └── [tag].tsx              Bookmarks filtered by tag
├── settings.tsx               Settings sample screen
├── browser.tsx                WebView screen
├── add-url.tsx                URL entry form sheet
├── add-bookmark.tsx           Bookmark editing form sheet
└── +not-found.tsx             Unknown route fallback
```

The root Stack owns every pushed screen and modal so that back behavior remains explicit and easy to inspect. The Drawer owns only the home route. Its custom content navigates to pushed Stack routes for tags and settings, which makes those screens display standard back navigation rather than a menu button.

### Route behavior

- The home menu button opens the Drawer.
- Drawer items navigate to the unread filter, tag routes, or settings.
- Bookmark cards on the home and tag screens push `/browser` with bookmark parameters.
- The home add button presents `/add-url` as a form sheet.
- The browser add/edit button presents `/add-bookmark` as a form sheet.
- The browser close button returns to the previous app screen.
- Standard Stack back buttons are used for tag and settings screens.
- WebView controls handle web history separately from app navigation.

Expo SDK 57 provides the Drawer through `expo-router/drawer`. Existing dependencies already include `react-native-reanimated`, `react-native-worklets`, and `react-native-gesture-handler`. Modal routes use `presentation: 'formSheet'` with numeric detents so they behave as native bottom sheets on Android and iOS.

## Screens

### Home

Home includes a menu button, title, filter chips, search field, bookmark cards, and an add button. Filters cover all bookmarks, unread bookmarks, and prominent sample tags. Cards expose a clear press target that opens the browser screen.

### Drawer

The custom Drawer resembles a compact bookmark organizer. It contains unread navigation, a tag hierarchy of up to three visual levels, settings, and a non-functional logout row labeled as a sample. Tag rows push the corresponding dynamic tag route.

### Tag bookmarks

The dynamic `/tags/[tag]` screen shows a standard Stack header with a back button, the selected tag, a search field, and matching bookmark cards. If no bookmarks match, it shows an empty-state explanation and a route back home.

### Settings

Settings demonstrates a pushed utility screen with a native back button. It contains local-only controls for opening links in-app and selecting system, light, or dark appearance. These settings may update in-memory UI state but are not persisted.

### Browser

Browser displays the bookmark URL with `react-native-webview`. The top area contains a close action and the current host. The bottom toolbar contains app back, add/edit bookmark, share, WebView reload, and WebView navigation controls. Web history and Expo Router history remain separate. Loading and error states are visible, and failed loads can be retried.

### Add URL form sheet

The first sheet accepts a URL, validates its scheme and host, and advances to the bookmark form. Invalid input remains on the sheet with an inline message. The sheet can be dismissed without changing data.

### Add bookmark form sheet

The second sheet edits a title, notes, tags, and unread status. Saving creates or updates an in-memory bookmark, dismisses the sheet, and returns to the underlying screen. Existing bookmarks prefill the form when opened from the browser.

## Visual design

The app follows the information architecture in the supplied flow diagram without reproducing its wireframe appearance literally.

- Warm off-white page background
- Ink-colored headers and controls
- Violet accent for active filters and primary actions
- Elevated paper-like bookmark cards
- Rounded controls with large mobile touch targets
- Small navigation-learning labels that identify Stack push, Drawer, and form-sheet transitions
- Platform-appropriate safe-area spacing and keyboard avoidance

The same information hierarchy is retained in dark mode through semantic color tokens rather than hard-coded per-screen colors.

## State and data flow

`BookmarkProvider` owns six initial bookmark records and exposes pure operations for adding, updating, filtering, and marking bookmarks as read. Screen components consume the provider through a hook. Pure filter and URL-validation functions remain outside React so they can be tested directly.

A bookmark contains:

- stable ID
- title
- URL
- optional notes
- tags
- unread status
- saved timestamp

Navigation parameters identify the bookmark or selected tag. The provider remains the source of truth for bookmark content; full records are not serialized into route parameters.

No data survives an application restart. This is intentional to keep the sample focused on navigation.

## Error handling

- URL entry rejects missing or unsupported HTTP/HTTPS URLs with an inline error.
- An unknown bookmark ID produces a recoverable empty state with a home action.
- WebView load failures show the URL, a short error message, and a retry button.
- Empty search or tag results show a useful empty state rather than a blank list.
- Modal close actions check whether navigation can go back and otherwise replace with home, which also keeps web behavior usable.

## Testing strategy

Implementation follows test-driven development.

1. Add failing unit tests for URL validation and bookmark filtering.
2. Add failing provider tests for add and update operations.
3. Add failing component tests for route destinations from Drawer rows and bookmark cards.
4. Add failing interaction tests for dismiss, save, retry, and back controls where the native boundary can be mocked reliably.
5. Implement the smallest behavior needed for each test to pass.
6. Run the Jest suite, Expo lint, and TypeScript compiler.
7. Launch the app and verify the navigation flow on the available simulator or web target.

Native WebView rendering, platform Drawer gestures, and native form-sheet animations are verified manually because Jest cannot validate those platform integrations meaningfully.

## Out of scope

- User authentication or a real logout flow
- Network-backed bookmark storage
- Persistent local storage
- Production-grade scraping of page titles or thumbnails
- Full browser functionality
- Pixel-perfect reproduction of the supplied wireframe
- Analytics, push notifications, and universal-link configuration

## Completion criteria

- Every route and transition in the approved navigation structure is reachable.
- Stack, Drawer, WebView history, and form-sheet navigation are visibly distinguishable.
- Back and close actions return to the expected screen.
- Adding and editing bookmarks updates the in-memory lists.
- Invalid URLs and WebView failures have recoverable UI.
- Automated tests, TypeScript, and lint checks pass.

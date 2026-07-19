# Navigation Learning Bookmark App

An Expo Router learning app that organizes sample bookmarks while demonstrating drawer, stack, form-sheet, and WebView navigation patterns.

## Prerequisites

- A current Node.js LTS release and npm
- Expo-supported iOS or Android tooling for native verification

## Run locally

```bash
npm install
npm start
```

## Quality checks

```bash
npx jest --runInBand
npm run lint
npx tsc --noEmit
```

## Routes and transitions

| Experience | Route | Navigation behavior |
| --- | --- | --- |
| Bookmark home | `/` | Front drawer with searchable All, Unread, React Native, and Navigation filters |
| Tag bookmarks | `/tags/[tag]` | Stack push from a nested drawer tag |
| Settings | `/settings` | Stack push from the drawer |
| Bookmark browser | `/browser?id=…` | Stack destination containing a WebView with its own back/forward history |
| Add URL | `/add-url` | Native form sheet that validates the first bookmark URL step |
| Add or edit bookmark | `/add-bookmark` | Native form sheet for bookmark fields and edits |
| Unknown route | Any unmatched path (`app/+not-found.tsx`) | Stack fallback with a replace action back to bookmarks |

## Data scope

Bookmark and settings data intentionally live only in React state for the current app session. This learning sample has no authentication, backend, database, or persistence layer.

## Manual native verification

- Open both add flows on iOS or Android and confirm their native form-sheet presentation, detents, keyboard behavior, save actions, and close fallback.
- Open a bookmark in the browser screen and confirm the WebView loads, its back/forward controls follow WebView history, and closing returns through the app stack.

# Navigation Learning App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Expo starter tabs with an in-memory bookmark app that teaches Stack, Drawer, form-sheet, and WebView navigation.

**Architecture:** Expo Router's root native Stack owns pushed pages and two native form-sheet routes, while a nested Drawer owns only the bookmark home page. `BookmarkProvider` is the single source of truth for records, `SettingsProvider` owns session-only preferences, and pure domain helpers handle URL validation and filtering. Screens compose a small bookmark UI kit and navigate with bookmark IDs or tag names rather than serialized records.

**Tech Stack:** Expo SDK 57, Expo Router, React 19, React Native 0.86, TypeScript 6, `react-native-webview`, vendored `expo-router/drawer`, Jest 29, `react-test-renderer`

---

## File map and visual direction

Create these focused units:

- `types/bookmark.ts`: bookmark and form input contracts.
- `data/bookmarks.ts`: six deterministic sample bookmarks and drawer tag hierarchy.
- `utils/bookmarks.ts`: URL normalization, filtering, tag matching, and host display.
- `providers/BookmarkProvider.tsx`: in-memory add/update/read state and lookup methods.
- `providers/SettingsProvider.tsx`: in-memory link and appearance preferences.
- `constants/Theme.ts`: light/dark semantic tokens; no screen-level color literals.
- `hooks/useAppTheme.ts`: resolves the selected appearance and returns semantic tokens.
- `components/bookmarks/*`: reusable card, list screen, empty state, route badge, and drawer content.
- `components/forms/*`: reusable labeled field and sheet scaffold.
- `app/*`: route files only; route files obtain parameters and compose domain components.

The design uses a warm paper canvas (`#F5F0E6`), pale cards (`#FFFCF7`), ink (`#29263A`), violet actions (`#6750C8`), muted plum (`#756F82`), and hairlines (`#DDD4C7`). Dark mode maps the same roles to `#181620`, `#24212E`, `#F3EEF8`, `#A995FF`, `#AAA2B6`, and `#3C3747`. System sans is used for content, bold system sans for display titles, and the existing SpaceMono font only for route-learning labels. The signature element is a compact “route stamp” such as `DRAWER → TAG STACK` or `FORM SHEET` attached to navigation actions; it makes the navigation lesson visible without decorating unrelated content.

Use `Pressable`, `StyleSheet.create`, continuous corners, `gap`, native Stack headers, native form sheets, and `contentInsetAdjustmentBehavior="automatic"`. Lists are small (six local records), so `FlatList` is sufficient; memoize `BookmarkCard` and keep its callback stable.

### Task 1: Add the bookmark domain and pure behavior

**Files:**
- Create: `types/bookmark.ts`
- Create: `data/bookmarks.ts`
- Create: `utils/bookmarks.ts`
- Test: `utils/__tests__/bookmarks-test.ts`

- [ ] **Step 1: Write failing URL and filtering tests**

```ts
import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import { filterBookmarks, getDisplayHost, normalizeHttpUrl } from '@/utils/bookmarks';

describe('normalizeHttpUrl', () => {
  it.each([
    ['https://docs.expo.dev/router/introduction/', 'https://docs.expo.dev/router/introduction/'],
    ['http://example.com/path', 'http://example.com/path'],
    ['  expo.dev  ', 'https://expo.dev/'],
    ['example.com:8080/path', 'https://example.com:8080/path'],
  ])('normalizes %s', (input, expected) => expect(normalizeHttpUrl(input)).toEqual({ ok: true, url: expected }));

  it.each(['', 'ftp://expo.dev', 'https://', 'not a host'])('rejects %s', (input) => {
    expect(normalizeHttpUrl(input)).toEqual({ ok: false, message: 'Enter a valid HTTP or HTTPS URL.' });
  });
});

describe('filterBookmarks', () => {
  it('filters unread records', () => expect(filterBookmarks(INITIAL_BOOKMARKS, { unreadOnly: true })).toHaveLength(4));
  it('matches title, URL, notes, and tags case-insensitively', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { query: 'NAVIGATION' }).map((item) => item.id)).toEqual(['expo-router', 'native-stack']);
  });
  it('matches a tag exactly', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { tag: 'React Native' }).every((item) => item.tags.includes('React Native'))).toBe(true);
  });
});

it('extracts a readable host', () => expect(getDisplayHost('https://docs.expo.dev/router/')).toBe('docs.expo.dev'));
```

- [ ] **Step 2: Run the test and verify the missing modules fail**

Run: `npx jest utils/__tests__/bookmarks-test.ts --runInBand`

Expected: FAIL with `Cannot find module '@/data/bookmarks'`.

- [ ] **Step 3: Add the domain contracts**

```ts
// types/bookmark.ts
export type Bookmark = {
  id: string;
  title: string;
  url: string;
  notes?: string;
  tags: string[];
  unread: boolean;
  savedAt: string;
};

export type BookmarkDraft = Pick<Bookmark, 'title' | 'url' | 'notes' | 'tags' | 'unread'>;
export type BookmarkFilter = { query?: string; tag?: string; unreadOnly?: boolean };
export type UrlValidationResult = { ok: true; url: string } | { ok: false; message: string };
```

- [ ] **Step 4: Add six sample records and the drawer hierarchy**

```ts
// data/bookmarks.ts
import type { Bookmark } from '@/types/bookmark';

export const INITIAL_BOOKMARKS: Bookmark[] = [
  { id: 'expo-router', title: 'Expo Router: Introduction', url: 'https://docs.expo.dev/router/introduction/', notes: 'File-based navigation and layouts.', tags: ['Development', 'React Native', 'Navigation'], unread: true, savedAt: '2026-07-18T01:00:00.000Z' },
  { id: 'native-stack', title: 'Native Stack Navigator', url: 'https://reactnavigation.org/docs/native-stack-navigator/', notes: 'Native headers, gestures, and transitions.', tags: ['Development', 'React Native', 'Navigation'], unread: false, savedAt: '2026-07-17T04:30:00.000Z' },
  { id: 'webview', title: 'React Native WebView', url: 'https://github.com/react-native-webview/react-native-webview', notes: 'Embedded browser reference.', tags: ['Development', 'React Native'], unread: true, savedAt: '2026-07-16T07:20:00.000Z' },
  { id: 'react-docs', title: 'Thinking in React', url: 'https://react.dev/learn/thinking-in-react', tags: ['Development', 'React'], unread: false, savedAt: '2026-07-15T02:10:00.000Z' },
  { id: 'design-systems', title: 'Design Systems Handbook', url: 'https://www.designbetter.co/design-systems-handbook', notes: 'Patterns for consistent product interfaces.', tags: ['Design', 'Reference'], unread: true, savedAt: '2026-07-14T09:45:00.000Z' },
  { id: 'accessibility', title: 'React Native Accessibility', url: 'https://reactnative.dev/docs/accessibility', notes: 'Accessible roles, labels, and actions.', tags: ['Development', 'React Native', 'Accessibility'], unread: true, savedAt: '2026-07-13T11:00:00.000Z' },
];

export const DRAWER_TAGS = [
  { label: 'Development', depth: 0 },
  { label: 'React Native', depth: 1 },
  { label: 'Navigation', depth: 2 },
  { label: 'Design', depth: 0 },
  { label: 'Reference', depth: 1 },
] as const;
```

- [ ] **Step 5: Implement pure helpers**

```ts
// utils/bookmarks.ts
import type { Bookmark, BookmarkFilter, UrlValidationResult } from '@/types/bookmark';

export function normalizeHttpUrl(rawValue: string): UrlValidationResult {
  const value = rawValue.trim();
  if (!value) return { ok: false, message: 'Enter a valid HTTP or HTTPS URL.' };
  const hasExplicitScheme = /^[a-z][a-z\d+.-]*:(?!\d+(?:[/?#]|$))/i.test(value);
  const candidate = hasExplicitScheme ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || !url.hostname.includes('.')) throw new Error('invalid');
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, message: 'Enter a valid HTTP or HTTPS URL.' };
  }
}

export function filterBookmarks(bookmarks: Bookmark[], filter: BookmarkFilter): Bookmark[] {
  const query = filter.query?.trim().toLocaleLowerCase() ?? '';
  return bookmarks.filter((bookmark) => {
    const searchable = [bookmark.title, bookmark.url, bookmark.notes ?? '', ...bookmark.tags].join(' ').toLocaleLowerCase();
    return (!filter.unreadOnly || bookmark.unread) && (!filter.tag || bookmark.tags.includes(filter.tag)) && (!query || searchable.includes(query));
  });
}

export function getDisplayHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
```

- [ ] **Step 6: Run the focused test**

Run: `npx jest utils/__tests__/bookmarks-test.ts --runInBand`

Expected: PASS (7 URL cases, 3 filter cases, and host display).

- [ ] **Step 7: Commit**

```bash
git add types/bookmark.ts data/bookmarks.ts utils/bookmarks.ts utils/__tests__/bookmarks-test.ts
git commit -m "feat: add bookmark domain helpers"
```

### Task 2: Add in-memory bookmark state with provider tests

**Files:**
- Create: `providers/BookmarkProvider.tsx`
- Test: `providers/__tests__/BookmarkProvider-test.tsx`

- [ ] **Step 1: Write failing provider interaction tests**

```tsx
import { act, create } from 'react-test-renderer';
import { BookmarkProvider, useBookmarks } from '@/providers/BookmarkProvider';

it('adds, updates, and marks records as read', () => {
  let api: ReturnType<typeof useBookmarks> | undefined;
  function Observer() { api = useBookmarks(); return null; }
  let tree: ReturnType<typeof create>;
  act(() => { tree = create(<BookmarkProvider><Observer /></BookmarkProvider>); });
  act(() => api?.addBookmark({ title: 'New', url: 'https://example.com/', tags: ['Reference'], unread: true }));
  const added = api?.bookmarks.find((item) => item.title === 'New');
  expect(added?.id).toBeTruthy();
  act(() => api?.updateBookmark(added!.id, { title: 'Updated' }));
  expect(api?.getBookmark(added!.id)?.title).toBe('Updated');
  act(() => api?.markAsRead(added!.id));
  expect(api?.getBookmark(added!.id)?.unread).toBe(false);
  act(() => tree!.unmount());
});

it('throws a useful error outside the provider', () => {
  function Invalid() { useBookmarks(); return null; }
  expect(() => { act(() => create(<Invalid />)); }).toThrow('useBookmarks must be used within BookmarkProvider');
});
```

- [ ] **Step 2: Run the test and verify the missing provider fails**

Run: `npx jest providers/__tests__/BookmarkProvider-test.tsx --runInBand`

Expected: FAIL with `Cannot find module '@/providers/BookmarkProvider'`.

- [ ] **Step 3: Implement the provider with stable operations**

```tsx
// providers/BookmarkProvider.tsx
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import type { Bookmark, BookmarkDraft } from '@/types/bookmark';

type BookmarkContextValue = {
  bookmarks: Bookmark[];
  addBookmark: (draft: BookmarkDraft) => string;
  updateBookmark: (id: string, changes: Partial<BookmarkDraft>) => void;
  markAsRead: (id: string) => void;
  getBookmark: (id: string) => Bookmark | undefined;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: PropsWithChildren) {
  const [bookmarks, setBookmarks] = useState(INITIAL_BOOKMARKS);
  const addBookmark = useCallback((draft: BookmarkDraft) => {
    const id = `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setBookmarks((current) => [{ ...draft, id, savedAt: new Date().toISOString() }, ...current]);
    return id;
  }, []);
  const updateBookmark = useCallback((id: string, changes: Partial<BookmarkDraft>) => {
    setBookmarks((current) => current.map((bookmark) => bookmark.id === id ? { ...bookmark, ...changes } : bookmark));
  }, []);
  const markAsRead = useCallback((id: string) => {
    setBookmarks((current) => current.map((bookmark) => bookmark.id === id ? { ...bookmark, unread: false } : bookmark));
  }, []);
  const getBookmark = useCallback((id: string) => bookmarks.find((bookmark) => bookmark.id === id), [bookmarks]);
  const value = useMemo(() => ({ bookmarks, addBookmark, updateBookmark, markAsRead, getBookmark }), [bookmarks, addBookmark, updateBookmark, markAsRead, getBookmark]);
  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const value = useContext(BookmarkContext);
  if (!value) throw new Error('useBookmarks must be used within BookmarkProvider');
  return value;
}
```

- [ ] **Step 4: Run the provider tests**

Run: `npx jest providers/__tests__/BookmarkProvider-test.tsx --runInBand`

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add providers/BookmarkProvider.tsx providers/__tests__/BookmarkProvider-test.tsx
git commit -m "feat: add in-memory bookmark provider"
```

### Task 3: Establish semantic theme, settings state, and root Stack

**Files:**
- Create: `constants/Theme.ts`
- Create: `providers/SettingsProvider.tsx`
- Create: `hooks/useAppTheme.ts`
- Modify: `app/_layout.tsx`
- Delete: `app/(tabs)/_layout.tsx`
- Delete: `app/(tabs)/index.tsx`
- Delete: `app/(tabs)/explore.tsx`
- Test: `providers/__tests__/SettingsProvider-test.tsx`

- [ ] **Step 1: Write the failing settings test**

```tsx
import { act, create } from 'react-test-renderer';
import { SettingsProvider, useSettings } from '@/providers/SettingsProvider';

it('updates session-only preferences', () => {
  let settings: ReturnType<typeof useSettings> | undefined;
  function Observer() { settings = useSettings(); return null; }
  act(() => { create(<SettingsProvider><Observer /></SettingsProvider>); });
  act(() => settings?.setOpenLinksInApp(false));
  act(() => settings?.setAppearance('dark'));
  expect(settings).toMatchObject({ openLinksInApp: false, appearance: 'dark' });
});
```

- [ ] **Step 2: Run it and verify the missing provider failure**

Run: `npx jest providers/__tests__/SettingsProvider-test.tsx --runInBand`

Expected: FAIL with `Cannot find module '@/providers/SettingsProvider'`.

- [ ] **Step 3: Implement settings and semantic tokens**

```tsx
// providers/SettingsProvider.tsx
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
export type Appearance = 'system' | 'light' | 'dark';
type Settings = { openLinksInApp: boolean; setOpenLinksInApp: (value: boolean) => void; appearance: Appearance; setAppearance: (value: Appearance) => void };
const SettingsContext = createContext<Settings | null>(null);
export function SettingsProvider({ children }: PropsWithChildren) {
  const [openLinksInApp, setOpenLinksInApp] = useState(true);
  const [appearance, setAppearance] = useState<Appearance>('system');
  const value = useMemo(() => ({ openLinksInApp, setOpenLinksInApp, appearance, setAppearance }), [openLinksInApp, appearance]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used within SettingsProvider');
  return value;
}
```

```ts
// constants/Theme.ts
export const Theme = {
  light: { canvas: '#F5F0E6', paper: '#FFFCF7', ink: '#29263A', accent: '#6750C8', muted: '#756F82', line: '#DDD4C7', danger: '#B34054' },
  dark: { canvas: '#181620', paper: '#24212E', ink: '#F3EEF8', accent: '#A995FF', muted: '#AAA2B6', line: '#3C3747', danger: '#FF8CA0' },
} as const;
export type AppTheme = (typeof Theme)[keyof typeof Theme];
```

```ts
// hooks/useAppTheme.ts
import { useColorScheme } from '@/hooks/useColorScheme';
import { Theme } from '@/constants/Theme';
import { useSettings } from '@/providers/SettingsProvider';
export function useAppTheme() {
  const system = useColorScheme() ?? 'light';
  const { appearance } = useSettings();
  const scheme = appearance === 'system' ? system : appearance;
  return { scheme, colors: Theme[scheme] };
}
```

- [ ] **Step 4: Replace the root layout with providers and explicit routes**

```tsx
// app/_layout.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { type PropsWithChildren, useEffect } from 'react';
import { BookmarkProvider } from '@/providers/BookmarkProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { useAppTheme } from '@/hooks/useAppTheme';

void SplashScreen.preventAutoHideAsync();

function NavigationTheme({ children }: PropsWithChildren) {
  const { scheme, colors } = useAppTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.canvas, card: colors.paper, text: colors.ink, primary: colors.accent, border: colors.line } }}>{children}<StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /></ThemeProvider>;
}

export default function RootLayout() {
  const [loaded] = useFonts({ SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf') });
  useEffect(() => { if (loaded) void SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;
  return <SettingsProvider><BookmarkProvider><NavigationTheme><Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    <Stack.Screen name="tags/[tag]" options={{ title: 'Tag bookmarks' }} />
    <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    <Stack.Screen name="browser" options={{ headerShown: false }} />
    <Stack.Screen name="add-url" options={{ presentation: 'formSheet', headerShown: false, sheetAllowedDetents: [0.48, 0.9], sheetInitialDetentIndex: 0, sheetGrabberVisible: true }} />
    <Stack.Screen name="add-bookmark" options={{ presentation: 'formSheet', headerShown: false, sheetAllowedDetents: [0.72, 1], sheetInitialDetentIndex: 0, sheetGrabberVisible: true }} />
    <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
  </Stack></NavigationTheme></BookmarkProvider></SettingsProvider>;
}
```

- [ ] **Step 5: Remove the old tab routes and run checks**

Run: `npx jest providers/__tests__/SettingsProvider-test.tsx --runInBand && npx tsc --noEmit`

Expected: settings test PASS; TypeScript may report missing route files until Tasks 5–9. Confirm there are no errors in the three new theme/settings files.

- [ ] **Step 6: Commit**

```bash
git add app/_layout.tsx constants/Theme.ts hooks/useAppTheme.ts providers/SettingsProvider.tsx providers/__tests__/SettingsProvider-test.tsx app/'(tabs)'
git commit -m "feat: establish bookmark navigation shell"
```

### Task 4: Build the shared bookmark and form UI kit

**Files:**
- Create: `components/bookmarks/RouteStamp.tsx`
- Create: `components/bookmarks/EmptyState.tsx`
- Create: `components/bookmarks/BookmarkCard.tsx`
- Create: `components/bookmarks/BookmarkList.tsx`
- Create: `components/forms/LabeledField.tsx`
- Create: `components/forms/SheetScaffold.tsx`
- Test: `components/bookmarks/__tests__/BookmarkCard-test.tsx`

- [ ] **Step 1: Write a failing card navigation test**

Mock `expo-router` with `push: jest.fn()`, render the first sample bookmark inside `SettingsProvider`, press the node with accessibility label `Open Expo Router: Introduction`, and assert:

```ts
expect(push).toHaveBeenCalledWith({ pathname: '/browser', params: { id: 'expo-router' } });
```

- [ ] **Step 2: Run it and verify `BookmarkCard` is missing**

Run: `npx jest components/bookmarks/__tests__/BookmarkCard-test.tsx --runInBand`

Expected: FAIL with `Cannot find module '../BookmarkCard'`.

- [ ] **Step 3: Implement the compact primitives**

`RouteStamp` renders a SpaceMono uppercase label with `accessibilityRole="text"`. `EmptyState` accepts `title`, `message`, `actionLabel`, and `onAction`, and uses a `Pressable` action. `LabeledField` owns label, `TextInput`, optional error text, and forwards `TextInputProps`. `SheetScaffold` uses `KeyboardAvoidingView`, a header row with Close, title, optional Save, and a `ScrollView` using `keyboardShouldPersistTaps="handled"`.

Use this public shape so every later task compiles without adaptation:

```ts
export type RouteStampProps = { children: string };
export type EmptyStateProps = { title: string; message: string; actionLabel: string; onAction: () => void };
export type LabeledFieldProps = TextInputProps & { label: string; error?: string; multiline?: boolean };
export type SheetScaffoldProps = PropsWithChildren<{ title: string; onClose: () => void; onSave?: () => void; saveLabel?: string; saveDisabled?: boolean }>;
```

- [ ] **Step 4: Implement the bookmark card**

```tsx
// essential behavior in components/bookmarks/BookmarkCard.tsx
export const BookmarkCard = memo(function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const open = useCallback(() => router.push({ pathname: '/browser', params: { id: bookmark.id } }), [router, bookmark.id]);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${bookmark.title}`} onPress={open} style={[styles.card, { backgroundColor: colors.paper, borderColor: colors.line }]}>
    <View style={styles.heading}><Text style={[styles.title, { color: colors.ink }]}>{bookmark.title}</Text>{bookmark.unread ? <View accessibilityLabel="Unread" style={[styles.dot, { backgroundColor: colors.accent }]} /> : null}</View>
    <Text style={{ color: colors.muted }}>{getDisplayHost(bookmark.url)}</Text>
    <View style={styles.tags}>{bookmark.tags.map((tag) => <Text key={tag} style={[styles.tag, { color: colors.accent, borderColor: colors.line }]}>{tag}</Text>)}</View>
    <RouteStamp>STACK → WEBVIEW</RouteStamp>
  </Pressable>;
});
```

`BookmarkList` accepts `{ bookmarks, emptyMessage }`, renders a `FlatList` with stable `keyExtractor`, `BookmarkCard`, 16-point content padding, and the supplied empty message. Keep styles in `StyleSheet.create`, with `borderCurve: 'continuous'` on cards and controls.

- [ ] **Step 5: Run the card test**

Run: `npx jest components/bookmarks/__tests__/BookmarkCard-test.tsx --runInBand`

Expected: PASS and `push` receives only the bookmark ID.

- [ ] **Step 6: Commit**

```bash
git add components/bookmarks components/forms
git commit -m "feat: add bookmark interface primitives"
```

### Task 5: Implement the Drawer and searchable home screen

**Files:**
- Create: `app/(drawer)/_layout.tsx`
- Create: `app/(drawer)/index.tsx`
- Create: `components/bookmarks/CustomDrawerContent.tsx`
- Test: `components/bookmarks/__tests__/CustomDrawerContent-test.tsx`
- Test: `app/__tests__/home-test.tsx`

- [ ] **Step 1: Write failing route-destination tests**

Mock `useRouter` and the Drawer navigation prop. Press `Unread`, `Navigation`, and `Settings`; assert these calls exactly:

```ts
expect(push).toHaveBeenCalledWith({ pathname: '/', params: { filter: 'unread' } });
expect(push).toHaveBeenCalledWith({ pathname: '/tags/[tag]', params: { tag: 'Navigation' } });
expect(push).toHaveBeenCalledWith('/settings');
expect(closeDrawer).toHaveBeenCalledTimes(3);
```

In the home test, press `Add bookmark` and assert `push('/add-url')`; press the menu control and assert `openDrawer()`.

- [ ] **Step 2: Run the tests and verify the missing screens fail**

Run: `npx jest components/bookmarks/__tests__/CustomDrawerContent-test.tsx app/__tests__/home-test.tsx --runInBand`

Expected: FAIL because the Drawer content and home route do not exist.

- [ ] **Step 3: Create the Drawer layout**

```tsx
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/components/bookmarks/CustomDrawerContent';
export default function DrawerLayout() {
  return <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerShown: false, drawerType: 'front' }}><Drawer.Screen name="index" /></Drawer>;
}
```

- [ ] **Step 4: Implement custom drawer navigation**

Use `DrawerContentScrollView` from `expo-router/drawer`, `DRAWER_TAGS`, and `Pressable` rows. Every route row must call `navigation.closeDrawer()` before `router.push`. Indent tag rows by `16 + depth * 18`, use accessibility labels `Unread`, each tag label, and `Settings`; render `Logout (sample)` disabled with `accessibilityState={{ disabled: true }}`. Display `RouteStamp` labels `DRAWER → FILTER` and `DRAWER → STACK` beside the applicable sections.

- [ ] **Step 5: Implement the home route**

Read `filter` with `useLocalSearchParams<{ filter?: string }>()`; derive `activeFilter`, query, and records with `filterBookmarks`. Use `useNavigation()` to call `navigation.openDrawer()`. Render menu/title, `All`, `Unread`, `React Native`, and `Navigation` chips, a search field, `BookmarkList`, and a floating `Pressable` labeled `Add bookmark` that pushes `/add-url`. Chips update local selection and never store a second filtered array in state.

- [ ] **Step 6: Run the focused tests**

Run: `npx jest components/bookmarks/__tests__/CustomDrawerContent-test.tsx app/__tests__/home-test.tsx --runInBand`

Expected: PASS for Drawer destinations, menu opening, and add-sheet destination.

- [ ] **Step 7: Commit**

```bash
git add app/'(drawer)' app/__tests__/home-test.tsx components/bookmarks/CustomDrawerContent.tsx components/bookmarks/__tests__/CustomDrawerContent-test.tsx
git commit -m "feat: add drawer and bookmark home"
```

### Task 6: Add tag results and in-memory settings pages

**Files:**
- Create: `app/tags/[tag].tsx`
- Create: `app/settings.tsx`
- Test: `app/__tests__/tag-screen-test.tsx`
- Test: `app/__tests__/settings-screen-test.tsx`

- [ ] **Step 1: Write failing screen tests**

For `[tag]`, mock `{ tag: 'Navigation' }`, render with both providers, and assert the title `Navigation`, route stamp `STACK PUSH`, and only matching cards. Mock `{ tag: 'Missing' }`, press `Back to all bookmarks`, and assert `replace('/')`.

For settings, find the `Switch` labeled `Open links inside the app`, invoke `onValueChange(false)`, press the `Dark` appearance row, and assert the observer sees `{ openLinksInApp: false, appearance: 'dark' }`.

- [ ] **Step 2: Run the tests and verify both routes are missing**

Run: `npx jest app/__tests__/tag-screen-test.tsx app/__tests__/settings-screen-test.tsx --runInBand`

Expected: FAIL with missing route modules.

- [ ] **Step 3: Implement the tag screen**

Set the native header title with `<Stack.Screen options={{ title: tag }} />`; decode the string parameter, hold only search query state, derive matching records with `filterBookmarks(bookmarks, { tag, query })`, and use `BookmarkList`. An empty result uses `EmptyState` with `Back to all bookmarks` and `router.replace('/')`. Include `RouteStamp>STACK PUSH</RouteStamp>` above the search field.

- [ ] **Step 4: Implement settings**

Use a root `ScrollView contentInsetAdjustmentBehavior="automatic"`. Render one `Switch` for `openLinksInApp` and three `Pressable` radio rows (`System`, `Light`, `Dark`) bound to `appearance`. Explanatory copy must say settings last only for the current app session. Keep the native Stack back button and add `RouteStamp>STACK PUSH</RouteStamp>` in content.

- [ ] **Step 5: Run focused tests and type-check these routes**

Run: `npx jest app/__tests__/tag-screen-test.tsx app/__tests__/settings-screen-test.tsx --runInBand && npx tsc --noEmit`

Expected: route tests PASS; TypeScript may still report only the not-yet-created browser and sheet routes.

- [ ] **Step 6: Commit**

```bash
git add app/tags/'[tag].tsx' app/settings.tsx app/__tests__/tag-screen-test.tsx app/__tests__/settings-screen-test.tsx
git commit -m "feat: add tag and settings stack screens"
```

### Task 7: Implement URL-entry form sheet

**Files:**
- Create: `app/add-url.tsx`
- Test: `app/__tests__/add-url-test.tsx`

- [ ] **Step 1: Write failing validation and navigation tests**

Render the route with a mocked router. Change the input labeled `Bookmark URL` to `ftp://expo.dev`, press `Continue`, and expect `Enter a valid HTTP or HTTPS URL.` without navigation. Change it to `expo.dev`, press again, and assert:

```ts
expect(replace).toHaveBeenCalledWith({ pathname: '/add-bookmark', params: { url: 'https://expo.dev/' } });
```

Press `Close`; when `canGoBack()` is true assert `back()`, and in a second test when false assert `replace('/')`.

- [ ] **Step 2: Run and verify the route is missing**

Run: `npx jest app/__tests__/add-url-test.tsx --runInBand`

Expected: FAIL with missing `app/add-url`.

- [ ] **Step 3: Implement the URL sheet**

Use `SheetScaffold` with title `Add a URL`, a `RouteStamp>FORM SHEET · STEP 1</RouteStamp>`, one URL `LabeledField`, and a primary `Continue` pressable. On submit call `normalizeHttpUrl`; retain invalid input and show the returned inline message. On success use `router.replace`, not `push`, so saving from step two dismisses the form flow back to the original screen. Implement close as:

```ts
function closeSheet() { if (router.canGoBack()) router.back(); else router.replace('/'); }
```

- [ ] **Step 4: Run the interaction tests**

Run: `npx jest app/__tests__/add-url-test.tsx --runInBand`

Expected: PASS for invalid, normalized success, back dismissal, and fallback dismissal.

- [ ] **Step 5: Commit**

```bash
git add app/add-url.tsx app/__tests__/add-url-test.tsx
git commit -m "feat: add URL entry form sheet"
```

### Task 8: Implement add/edit bookmark form sheet

**Files:**
- Create: `app/add-bookmark.tsx`
- Test: `app/__tests__/add-bookmark-test.tsx`

- [ ] **Step 1: Write failing create and update tests**

For create, mock `{ url: 'https://expo.dev/' }`, change `Title` to `Expo`, `Notes` to `Read later`, and `Tags` to `Development, Expo`; press `Save bookmark`; assert the provider gains a record with trimmed tags and router calls `back()`.

For edit, mock `{ id: 'expo-router' }`, assert the title and fields are prefilled, change the title, press `Save changes`, and assert the existing ID is updated without changing record count.

For unknown ID, assert `Bookmark not found` and press `Back to home` to verify `replace('/')`.

- [ ] **Step 2: Run and verify the route is missing**

Run: `npx jest app/__tests__/add-bookmark-test.tsx --runInBand`

Expected: FAIL with missing `app/add-bookmark`.

- [ ] **Step 3: Implement create/edit initialization and save**

Read `{ id, url }` params. Resolve `existing = id ? getBookmark(id) : undefined`; initialize title, notes, comma-separated tags, and unread from it, using `getDisplayHost(url)` as the new-bookmark title fallback. Do not use effects to mirror derived values. Save with this exact conversion:

```ts
const draft = { title: title.trim(), url: existing?.url ?? url, notes: notes.trim() || undefined, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean), unread };
if (existing) updateBookmark(existing.id, draft); else addBookmark(draft);
if (router.canGoBack()) router.back(); else router.replace('/');
```

Disable save when title or URL is empty. Use `SheetScaffold`, `LabeledField`s, a `Switch` labeled `Keep unread`, and `RouteStamp` text `FORM SHEET · EDIT` or `FORM SHEET · STEP 2`.

- [ ] **Step 4: Run the form tests**

Run: `npx jest app/__tests__/add-bookmark-test.tsx --runInBand`

Expected: PASS for create, update, unknown ID, and dismissal fallback.

- [ ] **Step 5: Commit**

```bash
git add app/add-bookmark.tsx app/__tests__/add-bookmark-test.tsx
git commit -m "feat: add bookmark editing form sheet"
```

### Task 9: Implement WebView browser with separate histories

**Files:**
- Create: `app/browser.tsx`
- Test: `app/__tests__/browser-test.tsx`

- [ ] **Step 1: Write failing browser-control tests**

Mock `react-native-webview` with a `forwardRef` exposing `goBack`, `goForward`, and `reload`. With `{ id: 'expo-router' }`, assert the WebView receives the provider URL. Invoke `onNavigationStateChange({ canGoBack: true, canGoForward: false, url })`; press `Web back` and expect only WebView `goBack`. Press `Close browser` and expect Expo Router `back`. Press `Edit bookmark` and assert:

```ts
expect(push).toHaveBeenCalledWith({ pathname: '/add-bookmark', params: { id: 'expo-router' } });
```

Invoke `onError`, assert the URL and `Page could not be loaded`, press `Retry`, and expect `reload`. Add a separate unknown-ID test for the recoverable home action.

- [ ] **Step 2: Run and verify the browser route is missing**

Run: `npx jest app/__tests__/browser-test.tsx --runInBand`

Expected: FAIL with missing `app/browser`.

- [ ] **Step 3: Implement browser state and controls**

Use `useRef<WebView>(null)`, local `canGoBack`, `canGoForward`, `loading`, and `error` state. On first valid render call `markAsRead(id)` once in an effect. The top bar has `Close browser`, host text, and `RouteStamp>STACK → WEB HISTORY</RouteStamp>`. The bottom toolbar has `App back`, `Edit bookmark`, `Share`, `Reload`, `Web back`, and `Web forward`; disable Web history buttons from navigation state. `Share` calls `Share.share({ title, message: url, url })`. Close uses Router back/fallback home; `App back` always operates on Router history and never calls WebView history.

Render an `ActivityIndicator` over the WebView while loading. On load error, retain the WebView but overlay an accessible error card showing the URL, `Page could not be loaded`, and `Retry`; retry clears error and calls `reload()`.

- [ ] **Step 4: Run browser tests**

Run: `npx jest app/__tests__/browser-test.tsx --runInBand`

Expected: PASS for route identity, separated histories, edit route, retry, and unknown bookmark.

- [ ] **Step 5: Commit**

```bash
git add app/browser.tsx app/__tests__/browser-test.tsx
git commit -m "feat: add bookmark WebView browser"
```

### Task 10: Finish fallback UX and automated verification

**Files:**
- Modify: `app/+not-found.tsx`
- Modify: `README.md`
- Modify: `components/__tests__/ThemedText-test.tsx` only if the starter snapshot is intentionally retained

- [ ] **Step 1: Replace the starter not-found screen**

Use semantic tokens, title `Route not found`, message `This navigation example does not include that route.`, `RouteStamp>STACK FALLBACK</RouteStamp>`, and a `Pressable` labeled `Back to bookmarks` that calls `router.replace('/')`.

- [ ] **Step 2: Document the learning routes**

Replace starter README instructions with prerequisites, `npm install`, `npm start`, `npm test -- --runInBand`, `npm run lint`, and `npx tsc --noEmit`. Include a short route table for Drawer, Stack push, form sheet, and WebView history, and state that data/settings are intentionally not persisted.

- [ ] **Step 3: Run all tests once**

Run: `npm test -- --runInBand`

Expected: all unit, provider, route, and interaction tests PASS with no open-handle warning.

- [ ] **Step 4: Run static verification**

Run: `npm run lint && npx tsc --noEmit`

Expected: both commands exit 0 with no warnings promoted to errors.

- [ ] **Step 5: Verify Expo bundling**

Run: `npx expo export --platform web --output-dir /tmp/navigation-learning-web`

Expected: export completes successfully and lists the static route output. If WebView lacks a web implementation in this SDK, use its provided web fallback rather than weakening native behavior.

- [ ] **Step 6: Launch and manually verify the route matrix**

Run: `npm run web`

Verify:

- Menu opens Drawer; unread, nested tag, and settings destinations work.
- Tag and settings screens show a native Stack back action.
- Bookmark cards open the browser and the close action returns to the originating list.
- Web back/forward do not pop Expo Router screens.
- Add URL and add/edit bookmark appear as native form sheets on an iOS or Android target.
- Invalid URL, unknown bookmark, empty results, and WebView error all offer recovery.
- Creating/editing updates home and tag lists without restarting the app.
- System/light/dark settings preserve readable semantic colors.

- [ ] **Step 7: Commit final polish**

```bash
git add app/+not-found.tsx README.md
git commit -m "docs: finish navigation learning app"
```

## Plan self-review

- Spec coverage: Tasks 3–9 cover the root Stack, Drawer-only home, pushed tag/settings pages, browser, both form sheets, provider state, search/filtering, settings, and recoverable errors. Task 10 covers fallback, automation, bundling, and manual native boundaries.
- API consistency: all routes pass `id`, `tag`, or normalized `url`; no route serializes a bookmark record. Both forms and browser use the same `canGoBack() ? back() : replace('/')` recovery rule.
- SDK 57 consistency: the installed Expo Router vendors Drawer primitives, so no `@react-navigation/drawer` dependency is added. Installed `react-native-screens` accepts sorted numeric `sheetAllowedDetents` arrays and numeric `sheetInitialDetentIndex`.
- Scope: persistence, authentication, scraping, analytics, and production browser features remain absent.

import type { Bookmark } from '@/types/bookmark';

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'expo-router',
    title: 'Expo Router: Introduction',
    url: 'https://docs.expo.dev/router/introduction/',
    notes: 'File-based navigation and layouts.',
    tags: ['Development', 'React Native', 'Navigation'],
    unread: true,
    savedAt: '2026-07-18T01:00:00.000Z',
  },
  {
    id: 'native-stack',
    title: 'Native Stack Navigator',
    url: 'https://reactnavigation.org/docs/native-stack-navigator/',
    notes: 'Native headers, gestures, and transitions.',
    tags: ['Development', 'React Native', 'Navigation'],
    unread: false,
    savedAt: '2026-07-17T04:30:00.000Z',
  },
  {
    id: 'webview',
    title: 'React Native WebView',
    url: 'https://github.com/react-native-webview/react-native-webview',
    notes: 'Embedded browser reference.',
    tags: ['Development', 'React Native'],
    unread: true,
    savedAt: '2026-07-16T07:20:00.000Z',
  },
  {
    id: 'react-docs',
    title: 'Thinking in React',
    url: 'https://react.dev/learn/thinking-in-react',
    tags: ['Development', 'React'],
    unread: false,
    savedAt: '2026-07-15T02:10:00.000Z',
  },
  {
    id: 'design-systems',
    title: 'Design Systems Handbook',
    url: 'https://www.designbetter.co/design-systems-handbook',
    notes: 'Patterns for consistent product interfaces.',
    tags: ['Design', 'Reference'],
    unread: true,
    savedAt: '2026-07-14T09:45:00.000Z',
  },
  {
    id: 'accessibility',
    title: 'React Native Accessibility',
    url: 'https://reactnative.dev/docs/accessibility',
    notes: 'Accessible roles, labels, and actions.',
    tags: ['Development', 'React Native', 'Accessibility'],
    unread: true,
    savedAt: '2026-07-13T11:00:00.000Z',
  },
];

export const DRAWER_TAGS = [
  { label: 'Development', depth: 0 },
  { label: 'React Native', depth: 1 },
  { label: 'Navigation', depth: 2 },
  { label: 'Design', depth: 0 },
  { label: 'Reference', depth: 1 },
] as const;

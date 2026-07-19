import { beforeEach, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import HomeScreen from '@/app/(drawer)/index';
import { BookmarkProvider } from '@/providers/BookmarkProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';

const mockOpenDrawer = jest.fn();
const mockPush = jest.fn();
const mockSetParams = jest.fn();
let mockParams: { filter?: string } = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useNavigation: () => ({ openDrawer: mockOpenDrawer }),
  useRouter: () => ({ push: mockPush, setParams: mockSetParams }),
}));
jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});

function home() {
  return <SettingsProvider><BookmarkProvider><HomeScreen /></BookmarkProvider></SettingsProvider>;
}

function hasCard(tree: ReactTestRenderer, title: string) {
  return tree.root.findAllByProps({ accessibilityLabel: `Open ${title}` }).length > 0;
}

beforeEach(() => {
  mockParams = {};
  jest.clearAllMocks();
});

it('renders searchable filters and opens drawer and add routes', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(home());
  });

  try {
    for (const text of ['Bookmarks', 'All', 'Unread', 'React Native', 'Navigation', 'DRAWER HOME']) {
      expect(tree!.root.findAllByProps({ children: text }).length).toBeGreaterThan(0);
    }
    expect(tree!.root.findByProps({ accessibilityLabel: 'Search bookmarks' })).toBeTruthy();
    expect(tree!.root.findByType(SafeAreaView).props.edges).toEqual(['top', 'bottom']);
    expect(tree!.root.findByProps({ children: 'Bookmarks' }).props.accessibilityRole).toBe('header');
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Open navigation menu' }).props.onPress();
      tree!.root.findByProps({ accessibilityLabel: 'Add bookmark' }).props.onPress();
    });
    expect(mockOpenDrawer).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/add-url');
  } finally {
    act(() => { tree?.unmount(); });
  }
});

it('derives selection and visible bookmarks from route params and search', () => {
  mockParams = { filter: 'unread' };
  let tree: ReactTestRenderer | undefined;
  act(() => { tree = create(home()); });

  try {
    expect(tree!.root.findByProps({ accessibilityLabel: 'Filter Unread' }).props.accessibilityState)
      .toEqual({ selected: true });
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(true);
    expect(hasCard(tree!, 'Native Stack Navigator')).toBe(false);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Filter Navigation' }).props.onPress();
    });
    expect(mockSetParams).toHaveBeenLastCalledWith({ filter: 'navigation' });
    mockParams = { filter: 'navigation' };
    act(() => { tree!.update(home()); });

    expect(tree!.root.findByProps({ accessibilityLabel: 'Filter Navigation' }).props.accessibilityState)
      .toEqual({ selected: true });
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(true);
    expect(hasCard(tree!, 'Native Stack Navigator')).toBe(true);
    expect(hasCard(tree!, 'React Native WebView')).toBe(false);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Search bookmarks' }).props.onChangeText('Native Stack');
    });
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(false);
    expect(hasCard(tree!, 'Native Stack Navigator')).toBe(true);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Search bookmarks' }).props.onChangeText('');
      tree!.root.findByProps({ accessibilityLabel: 'Filter All' }).props.onPress();
    });
    expect(mockSetParams).toHaveBeenLastCalledWith({ filter: 'all' });
    mockParams = { filter: 'all' };
    act(() => { tree!.update(home()); });
    expect(hasCard(tree!, 'React Native WebView')).toBe(true);
    expect(hasCard(tree!, 'Thinking in React')).toBe(true);

    mockParams = { filter: 'unexpected' };
    act(() => { tree!.update(home()); });
    expect(tree!.root.findByProps({ accessibilityLabel: 'Filter All' }).props.accessibilityState)
      .toEqual({ selected: true });
  } finally {
    act(() => { tree?.unmount(); });
  }
});

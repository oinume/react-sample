import { beforeEach, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';
import { Theme } from '@/constants/Theme';
import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import { SettingsProvider, useSettings } from '@/providers/SettingsProvider';
import type { Bookmark } from '@/types/bookmark';

const mockPush = jest.fn();
const mockOpenURL = jest.spyOn(Linking, 'openURL');
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');

  return {
    useAppTheme: () => ({ scheme: 'light', colors: Theme.light }),
  };
});

function CardHarness({ bookmark }: { bookmark: Bookmark }) {
  const { setOpenLinksInApp } = useSettings();

  return (
    <>
      <Pressable
        accessibilityLabel="Open links externally"
        onPress={() => setOpenLinksInApp(false)}>
        <Text>Open links externally</Text>
      </Pressable>
      <BookmarkCard bookmark={bookmark} />
    </>
  );
}

function card(bookmark: Bookmark) {
  return (
    <SettingsProvider>
      <CardHarness bookmark={bookmark} />
    </SettingsProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockOpenURL.mockResolvedValue(undefined);
});

it('derives a subtle card shadow from the active theme', () => {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(card(INITIAL_BOOKMARKS[0]));
  });

  try {
    const openButton = tree!.root.findByProps({
      accessibilityLabel: 'Open Expo Router: Introduction',
    });

    expect(StyleSheet.flatten(openButton.props.style)).toMatchObject({
      boxShadow: `0 6px 20px ${Theme.light.ink}1A`,
    });
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('renders duplicate bookmark tags only once', () => {
  let tree: ReactTestRenderer | undefined;
  const bookmark = {
    ...INITIAL_BOOKMARKS[0],
    tags: ['Development', 'Development', 'Navigation'],
  };

  act(() => {
    tree = create(card(bookmark));
  });

  try {
    const renderedTags = JSON.stringify(tree!.toJSON()).match(/Development/g) ?? [];
    expect(renderedTags).toHaveLength(1);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('shows bookmark details and opens the browser with only its ID', () => {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(card(INITIAL_BOOKMARKS[0]));
  });

  try {
    expect(tree!.root.findByProps({ children: 'Expo Router: Introduction' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'docs.expo.dev' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'Development' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'React Native' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'Navigation' })).toBeTruthy();
    const openButton = tree!.root.findByProps({
      accessibilityLabel: 'Open Expo Router: Introduction',
    });
    expect(openButton.props.accessibilityHint).toBe('Unread bookmark');
    expect(tree!.root.findByProps({ accessible: false })).toBeTruthy();

    act(() => {
      openButton.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/browser',
      params: { id: 'expo-router' },
    });
    expect(mockOpenURL).not.toHaveBeenCalled();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('opens the bookmark URL externally when the setting is disabled', async () => {
  let tree: ReactTestRenderer | undefined;
  await act(async () => {
    tree = create(card(INITIAL_BOOKMARKS[0]));
  });

  try {
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Open links externally' }).props.onPress();
    });
    await act(async () => {
      tree!.root
        .findByProps({ accessibilityLabel: 'Open Expo Router: Introduction' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(mockOpenURL).toHaveBeenCalledWith('https://docs.expo.dev/router/introduction/');
    expect(mockPush).not.toHaveBeenCalled();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('reports an external bookmark opening failure', async () => {
  mockOpenURL.mockRejectedValueOnce(new Error('Browser unavailable'));
  let tree: ReactTestRenderer | undefined;
  await act(async () => {
    tree = create(card(INITIAL_BOOKMARKS[0]));
  });

  try {
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Open links externally' }).props.onPress();
    });
    await act(async () => {
      tree!.root
        .findByProps({ accessibilityLabel: 'Open Expo Router: Introduction' })
        .props.onPress();
      await Promise.resolve();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Could not open link',
      'Please try opening the URL again.',
    );
    expect(mockPush).not.toHaveBeenCalled();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

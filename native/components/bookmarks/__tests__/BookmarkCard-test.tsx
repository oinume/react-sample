import { expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';
import { Theme } from '@/constants/Theme';
import { INITIAL_BOOKMARKS } from '@/data/bookmarks';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');

  return {
    useAppTheme: () => ({ scheme: 'light', colors: Theme.light }),
  };
});

it('derives a subtle card shadow from the active theme', () => {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(<BookmarkCard bookmark={INITIAL_BOOKMARKS[0]} />);
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
    tree = create(<BookmarkCard bookmark={bookmark} />);
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
    tree = create(<BookmarkCard bookmark={INITIAL_BOOKMARKS[0]} />);
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
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

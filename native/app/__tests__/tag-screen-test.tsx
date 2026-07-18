import { beforeEach, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import TagScreen from '@/app/tags/[tag]';
import { BookmarkProvider } from '@/providers/BookmarkProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockParams: { tag?: string | string[] } = { tag: 'Navigation' };

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }),
}));
jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});

function screen() {
  return (
    <SettingsProvider>
      <BookmarkProvider>
        <TagScreen />
      </BookmarkProvider>
    </SettingsProvider>
  );
}

function hasCard(tree: ReactTestRenderer, title: string) {
  return tree.root.findAllByProps({ accessibilityLabel: `Open ${title}` }).length > 0;
}

function hasHeader(tree: ReactTestRenderer, title: string) {
  return tree.root.findAllByProps({ children: title }).some(
    (instance) => instance.props.accessibilityRole === 'header',
  );
}

beforeEach(() => {
  mockParams = { tag: 'Navigation' };
  jest.clearAllMocks();
});

it('shows only exact tag matches and derives search results', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(hasHeader(tree!, 'Navigation')).toBe(true);
    expect(tree!.root.findByProps({ children: 'STACK PUSH' })).toBeTruthy();
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(true);
    expect(hasCard(tree!, 'Native Stack Navigator')).toBe(true);
    expect(hasCard(tree!, 'React Native WebView')).toBe(false);
    expect(hasCard(tree!, 'Thinking in React')).toBe(false);

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'Search tag bookmarks' })
        .props.onChangeText('Native Stack');
    });
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(false);
    expect(hasCard(tree!, 'Native Stack Navigator')).toBe(true);

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'Search tag bookmarks' })
        .props.onChangeText('not in this tag');
    });
    expect(tree!.root.findByProps({ children: 'No matching bookmarks' })).toBeTruthy();
    expect(tree!.root.findByProps({ accessibilityLabel: 'Back to all bookmarks' })).toBeTruthy();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('preserves a literal percent tag without decoding it', () => {
  mockParams = { tag: '100%' };
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(hasHeader(tree!, '100%')).toBe(true);
    expect(tree!.root.findByProps({ children: 'Bookmark not found' })).toBeTruthy();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('does not transform an encoded-looking tag into a matching tag', () => {
  mockParams = { tag: 'React%20Native' };
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(hasHeader(tree!, 'React%20Native')).toBe(true);
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(false);
    expect(hasCard(tree!, 'React Native WebView')).toBe(false);
    expect(tree!.root.findByProps({ children: 'Bookmark not found' })).toBeTruthy();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('uses the first array tag value', () => {
  mockParams = { tag: ['Navigation', 'Design'] };
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(hasHeader(tree!, 'Navigation')).toBe(true);
    expect(hasCard(tree!, 'Expo Router: Introduction')).toBe(true);
    expect(hasCard(tree!, 'Native Stack Navigator')).toBe(true);
    expect(hasCard(tree!, 'Design Systems Handbook')).toBe(false);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('falls back when the tag param is missing', () => {
  mockParams = {};
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(hasHeader(tree!, 'Unknown tag')).toBe(true);
    expect(tree!.root.findByProps({ children: 'Bookmark not found' })).toBeTruthy();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('recovers from a tag with no bookmarks', () => {
  mockParams = { tag: 'Missing' };
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(tree!.root.findByProps({ children: 'Missing' }).props.accessibilityRole).toBe('header');
    expect(tree!.root.findByProps({ children: 'Bookmark not found' })).toBeTruthy();
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Back to all bookmarks' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

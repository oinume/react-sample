import { beforeEach, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import AddBookmarkScreen from '@/app/add-bookmark';
import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import { BookmarkProvider, useBookmarks } from '@/providers/BookmarkProvider';

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockCanGoBack = true;
let mockParams: { id?: string | string[]; url?: string | string[] } = {};
let mockBookmarks: ReturnType<typeof useBookmarks> | undefined;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => mockCanGoBack,
    replace: mockReplace,
  }),
}));

jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});

function Observer() {
  const bookmarks = useBookmarks();
  React.useEffect(() => {
    mockBookmarks = bookmarks;
  }, [bookmarks]);
  return null;
}

function screen() {
  return (
    <BookmarkProvider>
      <AddBookmarkScreen />
      <Observer />
    </BookmarkProvider>
  );
}

function renderScreen() {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });
  return tree!;
}

beforeEach(() => {
  mockParams = {};
  mockCanGoBack = true;
  mockBookmarks = undefined;
  jest.clearAllMocks();
});

it('creates a bookmark from URL params and closes back', () => {
  mockParams = { url: 'https://expo.dev/' };
  const tree = renderScreen();

  try {
    expect(tree.root.findByProps({ accessibilityLabel: 'Title' }).props.value).toBe('expo.dev');
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Title' }).props.onChangeText('');
    });
    const disabledSave = tree.root.findByProps({ accessibilityLabel: 'Save bookmark' });
    expect(disabledSave.props.disabled).toBe(true);
    expect(disabledSave.props.accessibilityState).toEqual({ disabled: true });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Title' }).props.onChangeText('Expo');
      tree.root.findByProps({ accessibilityLabel: 'Notes' }).props.onChangeText('Read later');
      tree.root.findByProps({ accessibilityLabel: 'Tags (comma-separated)' }).props.onChangeText(
        ' Development, Expo ',
      );
    });
    const tags = tree.root.findByProps({ accessibilityLabel: 'Tags (comma-separated)' });
    expect(tags.props.autoCorrect).toBe(false);
    expect(tags.props.autoCapitalize).toBe('none');
    expect(tree.root.findByProps({ accessibilityLabel: 'Keep unread' }).props.value).toBe(true);

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Save bookmark' }).props.onPress();
    });

    expect(mockBookmarks!.bookmarks).toHaveLength(INITIAL_BOOKMARKS.length + 1);
    expect(mockBookmarks!.bookmarks[0]).toEqual(expect.objectContaining({
      title: 'Expo',
      url: 'https://expo.dev/',
      notes: 'Read later',
      tags: ['Development', 'Expo'],
      unread: true,
    }));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('resets form state when the route identity changes', () => {
  mockParams = { id: 'expo-router' };
  const tree = renderScreen();

  try {
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Title' }).props.onChangeText('Stale title');
    });
    mockParams = { id: 'native-stack' };
    act(() => { tree.update(screen()); });

    const nativeStack = INITIAL_BOOKMARKS[1];
    expect(tree.root.findByProps({ accessibilityLabel: 'Title' }).props.value)
      .toBe(nativeStack.title);
    expect(tree.root.findByProps({ accessibilityLabel: 'Notes' }).props.value)
      .toBe(nativeStack.notes);

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Title' }).props.onChangeText('Native Stack revised');
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Save changes' }).props.onPress();
    });
    expect(mockBookmarks!.getBookmark('expo-router')).toEqual(INITIAL_BOOKMARKS[0]);
    expect(mockBookmarks!.getBookmark('native-stack')).toEqual({
      ...nativeStack,
      title: 'Native Stack revised',
    });
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('normalizes a bare create URL and persists the unread toggle', () => {
  mockParams = { url: 'expo.dev' };
  const tree = renderScreen();

  try {
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Keep unread' }).props.onValueChange(false);
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Save bookmark' }).props.onPress();
    });
    expect(mockBookmarks!.bookmarks[0]).toEqual(expect.objectContaining({
      title: 'expo.dev',
      url: 'https://expo.dev/',
      unread: false,
    }));
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('recovers from an invalid create URL without exposing Save', () => {
  mockParams = { url: 'not a host' };
  const tree = renderScreen();

  try {
    expect(tree.root.findByProps({ children: 'Invalid bookmark URL' })).toBeTruthy();
    expect(tree.root.findAllByProps({ accessibilityLabel: 'Save bookmark' })).toHaveLength(0);
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Back to home' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('recovers from a missing create URL without exposing Save', () => {
  const tree = renderScreen();

  try {
    expect(tree.root.findByProps({ children: 'Invalid bookmark URL' })).toBeTruthy();
    expect(tree.root.findAllByProps({ accessibilityLabel: 'Save bookmark' })).toHaveLength(0);
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('prefills and updates an existing bookmark without adding a record', () => {
  mockParams = { id: 'expo-router' };
  const tree = renderScreen();
  const original = INITIAL_BOOKMARKS[0];

  try {
    expect(tree.root.findByProps({ accessibilityLabel: 'Title' }).props.value).toBe(original.title);
    expect(tree.root.findByProps({ accessibilityLabel: 'Notes' }).props.value).toBe(original.notes);
    expect(tree.root.findByProps({ accessibilityLabel: 'Tags (comma-separated)' }).props.value)
      .toBe(original.tags.join(', '));
    expect(tree.root.findByProps({ accessibilityLabel: 'Keep unread' }).props.value)
      .toBe(original.unread);

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Title' }).props.onChangeText('Expo Router guide');
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Save changes' }).props.onPress();
    });

    expect(mockBookmarks!.bookmarks).toHaveLength(INITIAL_BOOKMARKS.length);
    expect(mockBookmarks!.getBookmark(original.id)).toEqual({
      ...original,
      title: 'Expo Router guide',
    });
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('recovers from an unknown bookmark ID by returning home', () => {
  mockParams = { id: 'missing' };
  const tree = renderScreen();

  try {
    expect(tree.root.findByProps({ children: 'Bookmark not found' })).toBeTruthy();
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Back to home' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => { tree.unmount(); });
  }
});

it('replaces with home when Close cannot navigate back', () => {
  mockParams = { url: 'https://expo.dev/' };
  mockCanGoBack = false;
  const tree = renderScreen();

  try {
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Close' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockBack).not.toHaveBeenCalled();
  } finally {
    act(() => { tree.unmount(); });
  }
});

import { beforeEach, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { Alert, Linking, Platform, Share, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import BrowserScreen from '@/app/browser';
import { BookmarkProvider, useBookmarks } from '@/providers/BookmarkProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockWebGoBack = jest.fn();
const mockWebGoForward = jest.fn();
const mockWebReload = jest.fn();
const mockShare = jest.spyOn(Share, 'share');
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
const mockOpenURL = jest.spyOn(Linking, 'openURL');
let mockParams: { id?: string | string[] } = { id: 'expo-router' };
let mockWebViewInstanceCount = 0;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    push: mockPush,
    replace: mockReplace,
  }),
}));
jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});
jest.mock('react-native-webview', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const WebView = React.forwardRef(function MockWebView(props, ref) {
    const [mockInstanceId] = React.useState(() => ++mockWebViewInstanceCount);
    React.useImperativeHandle(ref, () => ({
      goBack: mockWebGoBack,
      goForward: mockWebGoForward,
      reload: mockWebReload,
    }));
    return React.createElement('WebView', { ...props, mockInstanceId });
  });
  return { WebView };
});

function Observer() {
  const { getBookmark } = useBookmarks();
  return <Text accessibilityLabel="bookmark-state">{String(getBookmark('expo-router')?.unread)}</Text>;
}

function screen() {
  return (
    <SettingsProvider>
      <BookmarkProvider>
        <BrowserScreen />
        <Observer />
      </BookmarkProvider>
    </SettingsProvider>
  );
}

beforeEach(() => {
  mockParams = { id: 'expo-router' };
  jest.clearAllMocks();
  mockCanGoBack.mockReturnValue(true);
  mockShare.mockResolvedValue({ action: Share.sharedAction });
  mockOpenURL.mockResolvedValue(undefined);
  mockWebViewInstanceCount = 0;
});

it('loads the bookmark, marks it read, and separates web and app history', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    const webView = tree!.root.findByType('WebView' as never);
    expect(webView.props.source).toEqual({ uri: 'https://docs.expo.dev/router/introduction/' });
    expect(tree!.root.findByProps({ accessibilityLabel: 'bookmark-state' }).props.children)
      .toBe('false');
    expect(tree!.root.findByProps({ children: 'STACK → WEB HISTORY' })).toBeTruthy();
    expect(tree!.root.findByProps({ accessibilityLabel: 'Page loading' }).props.accessibilityRole)
      .toBe('progressbar');

    act(() => {
      webView.props.onNavigationStateChange({
        canGoBack: true,
        canGoForward: false,
        loading: false,
        target: 1,
        title: 'Expo Router',
        url: 'https://docs.expo.dev/router/basics/',
      });
    });

    expect(tree!.root.findByProps({ children: 'docs.expo.dev' })).toBeTruthy();
    expect(tree!.root.findByProps({ accessibilityLabel: 'Web forward' }).props.disabled).toBe(true);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Web forward' }).props.accessibilityState)
      .toEqual({ disabled: true });

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Web back' }).props.onPress();
    });
    expect(mockWebGoBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Close browser' }).props.onPress();
      tree!.root.findByProps({ accessibilityLabel: 'App back' }).props.onPress();
      tree!.root.findByProps({ accessibilityLabel: 'Edit bookmark' }).props.onPress();
    });
    expect(mockBack).toHaveBeenCalledTimes(2);
    expect(mockWebGoBack).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/add-bookmark',
      params: { id: 'expo-router' },
    });
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('remounts clean browser state when the route bookmark changes', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    const firstWebView = tree!.root.findByType('WebView' as never);
    const firstInstanceId = firstWebView.props.mockInstanceId;
    act(() => {
      firstWebView.props.onNavigationStateChange({
        canGoBack: true,
        canGoForward: true,
        loading: false,
        target: 1,
        title: 'Old history',
        url: 'https://old.example/history',
      });
      firstWebView.props.onError({
        nativeEvent: {
          canGoBack: true,
          canGoForward: true,
          code: -1,
          description: 'Old error',
          loading: false,
          title: 'Old error',
          url: 'https://old.example/error',
        },
      });
    });

    mockParams = { id: 'webview' };
    act(() => {
      tree!.update(screen());
    });

    const nextWebView = tree!.root.findByType('WebView' as never);
    expect(nextWebView.props.mockInstanceId).not.toBe(firstInstanceId);
    expect(nextWebView.props.source).toEqual({
      uri: 'https://github.com/react-native-webview/react-native-webview',
    });
    expect(tree!.root.findByProps({ children: 'github.com' })).toBeTruthy();
    expect(tree!.root.findAllByProps({ children: 'Page could not be loaded' })).toHaveLength(0);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Web back' }).props.disabled).toBe(true);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Web forward' }).props.disabled).toBe(true);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Page loading' })).toBeTruthy();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('shows a recoverable error over the current URL', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    const webView = tree!.root.findByType('WebView' as never);
    act(() => {
      webView.props.onError({
        nativeEvent: {
          canGoBack: true,
          canGoForward: true,
          code: -1,
          description: 'DNS lookup failed',
          loading: false,
          title: 'Unavailable',
          url: 'https://errors.example/unavailable',
        },
      });
    });

    expect(tree!.root.findByProps({ children: 'Page could not be loaded' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'errors.example' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'https://errors.example/unavailable' }).props.numberOfLines)
      .toBe(2);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Web back' }).props.disabled).toBe(false);
    expect(tree!.root.findByProps({ accessibilityLabel: 'Web forward' }).props.disabled).toBe(false);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Web back' }).props.onPress();
      tree!.root.findByProps({ accessibilityLabel: 'Web forward' }).props.onPress();
      tree!.root.findByProps({ accessibilityLabel: 'Share' }).props.onPress();
    });
    expect(mockWebGoBack).toHaveBeenCalledTimes(1);
    expect(mockWebGoForward).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith({
      title: 'Expo Router: Introduction',
      message: 'https://errors.example/unavailable',
      url: 'https://errors.example/unavailable',
    });

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Retry' }).props.onPress();
    });
    expect(mockWebReload).toHaveBeenCalledTimes(1);
    expect(tree!.root.findAllByProps({ children: 'Page could not be loaded' })).toHaveLength(0);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Reload' }).props.onPress();
    });
    expect(mockWebReload).toHaveBeenCalledTimes(2);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('reports share failures instead of leaving an unhandled rejection', async () => {
  mockShare.mockRejectedValueOnce(new Error('Share unavailable'));
  let tree: ReactTestRenderer | undefined;
  await act(async () => {
    tree = create(screen());
  });

  try {
    await act(async () => {
      tree!.root.findByProps({ accessibilityLabel: 'Share' }).props.onPress();
      await Promise.resolve();
    });
    expect(mockAlert).toHaveBeenCalledWith(
      'Share failed',
      'Unable to share this bookmark.',
    );
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('falls back to home for app controls without router history', () => {
  mockCanGoBack.mockReturnValue(false);
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Close browser' }).props.onPress();
      tree!.root.findByProps({ accessibilityLabel: 'App back' }).props.onPress();
    });
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenNthCalledWith(1, '/');
    expect(mockReplace).toHaveBeenNthCalledWith(2, '/');
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('recovers from an unknown bookmark without mounting a WebView', () => {
  mockParams = { id: 'missing' };
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(tree!.root.findAllByType('WebView' as never)).toHaveLength(0);
    expect(tree!.root.findByProps({ children: 'Bookmark not found' })).toBeTruthy();
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Back to home' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('uses an external browser fallback on web and handles opening failures', async () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web');
  mockCanGoBack.mockReturnValue(false);
  let tree: ReactTestRenderer | undefined;

  try {
    await act(async () => {
      tree = create(screen());
    });

    expect(tree!.root.findAllByType('WebView' as never)).toHaveLength(0);
    expect(tree!.root.findAllByProps({ accessibilityLabel: 'Page loading' })).toHaveLength(0);
    expect(tree!.root.findByProps({ children: 'Embedded browser unavailable on web' })).toBeTruthy();
    expect(
      tree!.root.findByProps({ children: 'https://docs.expo.dev/router/introduction/' }),
    ).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'docs.expo.dev' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'STACK → WEB HISTORY' })).toBeTruthy();

    await act(async () => {
      tree!.root.findByProps({ accessibilityLabel: 'Open in browser' }).props.onPress();
      await Promise.resolve();
    });
    expect(mockOpenURL).toHaveBeenCalledWith('https://docs.expo.dev/router/introduction/');

    mockOpenURL.mockRejectedValueOnce(new Error('Browser unavailable'));
    await act(async () => {
      tree!.root.findByProps({ accessibilityLabel: 'Open in browser' }).props.onPress();
      await Promise.resolve();
    });
    expect(mockAlert).toHaveBeenCalledWith(
      'Could not open link',
      'Please try opening the URL again.',
    );

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Close browser' }).props.onPress();
    });
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => {
      tree?.unmount();
    });
    platform.restore();
  }
});

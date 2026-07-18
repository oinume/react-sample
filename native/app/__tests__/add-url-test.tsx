import { beforeEach, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import AddUrlScreen from '@/app/add-url';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    replace: mockReplace,
  }),
}));
jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack.mockReturnValue(true);
});

it('validates and normalizes the URL before replacing the sheet', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<AddUrlScreen />);
  });

  try {
    expect(tree!.root.findByProps({ children: 'Add a URL' }).props.accessibilityRole).toBe('header');
    expect(tree!.root.findByProps({ children: 'FORM SHEET · STEP 1' })).toBeTruthy();
    const input = tree!.root.findByProps({ accessibilityLabel: 'Bookmark URL' });
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
    expect(input.props.keyboardType).toBe('url');

    act(() => {
      input.props.onChangeText('ftp://expo.dev');
      tree!.root.findByProps({ accessibilityLabel: 'Continue' }).props.onPress();
    });
    expect(
      tree!.root.findByProps({ children: 'Enter a valid HTTP or HTTPS URL.' }),
    ).toBeTruthy();
    expect(tree!.root.findByProps({ accessibilityLabel: 'Bookmark URL' }).props.value)
      .toBe('ftp://expo.dev');
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'Bookmark URL' })
        .props.onChangeText('expo.dev');
    });
    expect(
      tree!.root.findAllByProps({ children: 'Enter a valid HTTP or HTTPS URL.' }),
    ).toHaveLength(0);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Continue' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/add-bookmark',
      params: { url: 'https://expo.dev/' },
    });
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('closes with back when the sheet can go back', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<AddUrlScreen />);
  });

  try {
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Close' }).props.onPress();
    });
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('replaces with home when the sheet cannot go back', () => {
  mockCanGoBack.mockReturnValue(false);
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<AddUrlScreen />);
  });

  try {
    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Close' }).props.onPress();
    });
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

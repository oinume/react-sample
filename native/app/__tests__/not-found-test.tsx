import { expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import NotFoundScreen from '@/app/+not-found';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});

it('explains the missing route and replaces it with bookmarks', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => { tree = create(<NotFoundScreen />); });

  try {
    const title = tree!.root.findByProps({ children: 'Route not found' });
    expect(title.props.accessibilityRole).toBe('header');
    expect(tree!.root.findByProps({
      children: 'This navigation example does not include that route.',
    })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'STACK FALLBACK' })).toBeTruthy();
    expect(tree!.root.findByType(SafeAreaView).props.edges).toEqual(['bottom']);
    const scrollView = tree!.root.findByType(ScrollView);
    expect(scrollView.props.contentInsetAdjustmentBehavior).toBe('automatic');
    expect(StyleSheet.flatten(scrollView.props.contentContainerStyle).flexGrow).toBe(1);

    act(() => {
      tree!.root.findByProps({ accessibilityLabel: 'Back to bookmarks' }).props.onPress();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  } finally {
    act(() => { tree?.unmount(); });
  }
});

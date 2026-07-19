import { expect, it, jest } from '@jest/globals';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import * as React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { CustomDrawerContent } from '@/components/bookmarks/CustomDrawerContent';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-router/drawer', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    DrawerContentScrollView: ({ children, ...props }: React.ComponentProps<typeof View>) => (
      <View {...props}>{children}</View>
    ),
  };
});
jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');
  return { useAppTheme: () => ({ scheme: 'light', colors: Theme.light }) };
});

function drawerProps(closeDrawer = jest.fn()) {
  return {
    closeDrawer,
    props: {
      navigation: { closeDrawer },
      state: { index: 0, key: 'drawer', routeNames: ['index'], routes: [] },
      descriptors: {},
    } as unknown as DrawerContentComponentProps,
  };
}

it('closes before routing to unread, a nested tag, and settings', () => {
  const { closeDrawer, props } = drawerProps();
  let tree: ReactTestRenderer | undefined;
  act(() => { tree = create(<CustomDrawerContent {...props} />); });

  try {
    for (const label of ['Unread', 'Navigation', 'Settings']) {
      act(() => { tree!.root.findByProps({ accessibilityLabel: label }).props.onPress(); });
    }
    expect(mockPush.mock.calls).toEqual([
      [{ pathname: '/', params: { filter: 'unread' } }],
      [{ pathname: '/tags/[tag]', params: { tag: 'Navigation' } }],
      ['/settings'],
    ]);
    expect(closeDrawer).toHaveBeenCalledTimes(3);
    for (let index = 0; index < 3; index += 1) {
      expect(closeDrawer.mock.invocationCallOrder[index]).toBeLessThan(
        mockPush.mock.invocationCallOrder[index],
      );
    }
  } finally {
    act(() => { tree?.unmount(); });
  }
});

it('shows tag hierarchy route stamps and disabled sample logout', () => {
  const { props } = drawerProps();
  let tree: ReactTestRenderer | undefined;
  act(() => { tree = create(<CustomDrawerContent {...props} />); });

  try {
    for (const text of ['Development', 'React Native', 'Navigation', 'DRAWER → FILTER', 'DRAWER → STACK']) {
      expect(tree!.root.findByProps({ children: text })).toBeTruthy();
    }
    const logout = tree!.root.findByProps({ accessibilityLabel: 'Logout (sample)' });
    expect(logout.props.disabled).toBe(true);
    expect(logout.props.accessibilityState).toEqual({ disabled: true });
    expect(tree!.root.findByProps({ children: 'Your reading map' }).props.accessibilityRole)
      .toBe('header');
    expect(tree!.root.findByProps({ accessibilityLabel: 'Navigation' }).props.accessibilityHint)
      .toBe('Level 3 tag');
  } finally {
    act(() => { tree?.unmount(); });
  }
});

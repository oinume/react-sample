import { expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import SettingsScreen from '@/app/settings';
import { Theme } from '@/constants/Theme';
import { SettingsProvider, useSettings } from '@/providers/SettingsProvider';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
}));
jest.mock('@/hooks/useColorScheme', () => ({ useColorScheme: () => 'light' }));

function Observer() {
  const { appearance, openLinksInApp } = useSettings();
  return <Text>{JSON.stringify({ openLinksInApp, appearance })}</Text>;
}

function screen() {
  return (
    <SettingsProvider>
      <SettingsScreen />
      <Observer />
    </SettingsProvider>
  );
}

it('updates session settings with accessible controls', () => {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(screen());
  });

  try {
    expect(tree!.root.findByProps({ children: 'Settings' }).props.accessibilityRole).toBe('header');
    expect(tree!.root.findByProps({ children: 'STACK PUSH' })).toBeTruthy();
    expect(
      tree!.root.findByProps({
        children: 'These settings last only for the current app session.',
      }),
    ).toBeTruthy();

    const system = tree!.root.findByProps({ accessibilityLabel: 'System' });
    const light = tree!.root.findByProps({ accessibilityLabel: 'Light' });
    const dark = tree!.root.findByProps({ accessibilityLabel: 'Dark' });
    for (const row of [system, light, dark]) {
      expect(row.props.accessibilityRole).toBe('radio');
    }
    expect(system.props.accessibilityState).toEqual({ checked: true });
    expect(light.props.accessibilityState).toEqual({ checked: false });
    expect(dark.props.accessibilityState).toEqual({ checked: false });
    expect(tree!.root.findByProps({ accessibilityLabel: 'Appearance' }).props.accessibilityRole)
      .toBe('radiogroup');

    act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'Open links inside the app' })
        .props.onValueChange(false);
      dark.props.onPress();
    });

    expect(
      tree!.root.findByProps({
        children: JSON.stringify({ openLinksInApp: false, appearance: 'dark' }),
      }),
    ).toBeTruthy();
    expect(tree!.root.findByProps({ accessibilityLabel: 'System' }).props.accessibilityState)
      .toEqual({ checked: false });
    expect(tree!.root.findByProps({ accessibilityLabel: 'Dark' }).props.accessibilityState)
      .toEqual({ checked: true });
    expect(StyleSheet.flatten(tree!.root.findByType(ScrollView).props.style).backgroundColor)
      .toBe(Theme.dark.canvas);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

import type { PropsWithChildren } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export type RouteStampProps = PropsWithChildren<{
  children: string;
}>;

export function RouteStamp({ children }: RouteStampProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      accessibilityRole="text"
      style={[
        styles.stamp,
        {
          backgroundColor: colors.paper,
          borderColor: colors.line,
          color: colors.accent,
        },
      ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  stamp: {
    alignSelf: 'flex-start',
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 0.4,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
});

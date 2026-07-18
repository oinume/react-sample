import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onAction}
        style={[styles.action, { backgroundColor: colors.accent }]}>
        <Text style={[styles.actionLabel, { color: colors.paper }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});

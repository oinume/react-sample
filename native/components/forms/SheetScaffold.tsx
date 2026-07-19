import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';

export type SheetScaffoldProps = PropsWithChildren<{
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
}>;

export function SheetScaffold({
  children,
  title,
  onClose,
  onSave,
  saveLabel = 'Save',
  saveDisabled = false,
}: SheetScaffoldProps) {
  const { colors } = useAppTheme();
  const headerActionStyle = [
    styles.headerAction,
    { backgroundColor: colors.paper, borderColor: colors.line },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.canvas }]}>
      <SafeAreaView edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.line }]}>
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            onPress={onClose}
            style={headerActionStyle}>
            <Text style={[styles.headerActionLabel, { color: colors.accent }]}>Close</Text>
          </Pressable>
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            style={[styles.title, { color: colors.ink }]}>
            {title}
          </Text>
          {onSave ? (
            <Pressable
              accessibilityLabel={saveLabel}
              accessibilityRole="button"
              accessibilityState={{ disabled: saveDisabled }}
              disabled={saveDisabled}
              onPress={onSave}
              style={headerActionStyle}>
              <Text
                style={[
                  styles.headerActionLabel,
                  { color: saveDisabled ? colors.muted : colors.accent },
                ]}>
                {saveLabel}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.headerActionSpacer} />
          )}
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerAction: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 72,
    paddingHorizontal: 10,
  },
  headerActionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerActionSpacer: {
    minWidth: 72,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
});

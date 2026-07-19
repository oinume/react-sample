import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type Appearance, useSettings } from '@/providers/SettingsProvider';

const APPEARANCE_OPTIONS: readonly { label: string; value: Appearance }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { appearance, openLinksInApp, setAppearance, setOpenLinksInApp } = useSettings();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>
          Settings
        </Text>
        <RouteStamp>STACK PUSH</RouteStamp>
        <Text style={[styles.sessionCopy, { color: colors.muted }]}>
          These settings last only for the current app session.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.paper, borderColor: colors.line }]}>
        <View style={styles.switchRow}>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: colors.ink }]}>Open links inside the app</Text>
            <Text style={[styles.rowDescription, { color: colors.muted }]}>
              Use the in-app browser when opening a bookmark.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Open links inside the app"
            onValueChange={setOpenLinksInApp}
            trackColor={{ false: colors.line, true: colors.accent }}
            value={openLinksInApp}
          />
        </View>
      </View>

      <View style={styles.appearanceSection}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>Appearance</Text>
        <View
          accessibilityLabel="Appearance"
          accessibilityRole="radiogroup"
          style={styles.options}>
          {APPEARANCE_OPTIONS.map((option) => {
            const checked = appearance === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                onPress={() => setAppearance(option.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: checked ? colors.paper : colors.canvas,
                    borderColor: checked ? colors.accent : colors.line,
                  },
                ]}>
                <Text style={[styles.optionIndicator, { color: colors.accent }]}>
                  {checked ? '●' : '○'}
                </Text>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 24, padding: 16, paddingBottom: 32 },
  heading: { alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 31 },
  sessionCopy: { fontSize: 15, lineHeight: 22 },
  section: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 16, minHeight: 44 },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowDescription: { fontSize: 14, lineHeight: 20 },
  appearanceSection: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  options: { gap: 8 },
  option: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  optionIndicator: { fontSize: 18, width: 22 },
});

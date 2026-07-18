import { useRouter } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { DRAWER_TAGS } from '@/data/bookmarks';
import { useAppTheme } from '@/hooks/useAppTheme';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const router = useRouter();
  const { colors } = useAppTheme();
  const closeAndPush = (route: Parameters<typeof router.push>[0]) => {
    navigation.closeDrawer();
    router.push(route);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.content}
      style={{ backgroundColor: colors.canvas }}>
      <View style={[styles.header, { backgroundColor: colors.paper, borderColor: colors.line }]}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>BOOKMARK ORGANIZER</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>
          Your reading map
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Filter, browse, and keep moving.</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>LIBRARY</Text>
          <RouteStamp>DRAWER → FILTER</RouteStamp>
        </View>
        <Pressable
          accessibilityLabel="All"
          accessibilityRole="button"
          onPress={() => closeAndPush('/')}
          style={[styles.row, { borderColor: colors.line }]}>
          <Text style={[styles.rowLabel, { color: colors.ink }]}>All</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Unread"
          accessibilityRole="button"
          onPress={() => closeAndPush({ pathname: '/', params: { filter: 'unread' } })}
          style={[styles.row, { borderColor: colors.line }]}>
          <Text style={[styles.rowLabel, { color: colors.ink }]}>Unread</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>TAGS</Text>
        {DRAWER_TAGS.map((row) => (
          <Pressable
            key={row.label}
            accessibilityHint={`Level ${row.depth + 1} tag`}
            accessibilityLabel={row.label}
            accessibilityRole="button"
            onPress={() => closeAndPush({ pathname: '/tags/[tag]', params: { tag: row.label } })}
            style={[styles.row, { borderColor: colors.line, paddingLeft: 16 + row.depth * 18 }]}>
            <Text style={[styles.rowLabel, { color: colors.ink }]}>{row.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>ACCOUNT</Text>
          <RouteStamp>DRAWER → STACK</RouteStamp>
        </View>
        <Pressable
          accessibilityLabel="Settings"
          accessibilityRole="button"
          onPress={() => closeAndPush('/settings')}
          style={[styles.row, { borderColor: colors.line }]}>
          <Text style={[styles.rowLabel, { color: colors.ink }]}>Settings</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Logout (sample)"
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          style={[styles.row, styles.disabledRow, { borderColor: colors.line }]}>
          <Text style={[styles.rowLabel, { color: colors.muted }]}>Logout (sample)</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 24, padding: 16 },
  header: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  eyebrow: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 0.8 },
  title: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  section: { gap: 8 },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 0.7 },
  row: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  disabledRow: { opacity: 0.55 },
});

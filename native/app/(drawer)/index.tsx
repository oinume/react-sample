import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookmarkList } from '@/components/bookmarks/BookmarkList';
import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBookmarks } from '@/providers/BookmarkProvider';
import type { BookmarkFilter } from '@/types/bookmark';
import { filterBookmarks } from '@/utils/bookmarks';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'React Native', value: 'react-native' },
  { label: 'Navigation', value: 'navigation' },
] as const;
type FilterValue = (typeof FILTERS)[number]['value'];
type DrawerParamList = { index: { filter?: string } | undefined };

function normalizeFilter(filter: string | undefined): FilterValue {
  return FILTERS.find((item) => item.value === filter)?.value ?? 'all';
}

export default function HomeScreen() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList, 'index'>>();
  const router = useRouter();
  const { bookmarks } = useBookmarks();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const activeFilter = normalizeFilter(filter);

  const visibleBookmarks = useMemo(() => {
    const bookmarkFilter: BookmarkFilter = { query };
    if (activeFilter === 'unread') bookmarkFilter.unreadOnly = true;
    if (activeFilter === 'react-native') bookmarkFilter.tag = 'React Native';
    if (activeFilter === 'navigation') bookmarkFilter.tag = 'Navigation';
    return filterBookmarks(bookmarks, bookmarkFilter);
  }, [activeFilter, bookmarks, query]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Open navigation menu"
          accessibilityRole="button"
          onPress={() => navigation.openDrawer()}
          style={[styles.iconButton, { backgroundColor: colors.paper, borderColor: colors.line }]}>
          <Text style={[styles.menuIcon, { color: colors.ink }]}>☰</Text>
        </Pressable>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>
            Bookmarks
          </Text>
          <RouteStamp>DRAWER HOME</RouteStamp>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.chips}>
          {FILTERS.map((item) => {
            const selected = activeFilter === item.value;
            return (
              <Pressable
                key={item.value}
                accessibilityLabel={`Filter ${item.label}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => router.setParams({ filter: item.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.accent : colors.paper,
                    borderColor: selected ? colors.accent : colors.line,
                  },
                ]}>
                <Text style={[styles.chipLabel, { color: selected ? colors.paper : colors.ink }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          accessibilityLabel="Search bookmarks"
          onChangeText={setQuery}
          placeholder="Search title, URL, notes, or tags"
          placeholderTextColor={colors.muted}
          style={[
            styles.search,
            { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink },
          ]}
          value={query}
        />
      </View>

      <View style={styles.list}>
        <BookmarkList bookmarks={visibleBookmarks} emptyMessage="No bookmarks match this view." />
      </View>
      <View style={styles.addBar}>
        <Pressable
          accessibilityLabel="Add bookmark"
          accessibilityRole="button"
          onPress={() => router.push('/add-url')}
          style={[styles.addButton, { backgroundColor: colors.accent }]}>
          <Text style={[styles.addLabel, { color: colors.paper }]}>＋ Add bookmark</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 16 },
  iconButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  menuIcon: { fontSize: 20, fontWeight: '700' },
  headingCopy: { alignItems: 'flex-start', flex: 1, gap: 6 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 31 },
  controls: { gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  chipLabel: { fontSize: 14, fontWeight: '700' },
  search: {
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  list: { flex: 1 },
  addBar: { alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12 },
  addButton: {
    borderCurve: 'continuous',
    borderRadius: 22,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  addLabel: { fontSize: 15, fontWeight: '800' },
});

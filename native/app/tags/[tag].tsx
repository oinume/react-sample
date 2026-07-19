import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BookmarkList } from '@/components/bookmarks/BookmarkList';
import { EmptyState } from '@/components/bookmarks/EmptyState';
import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBookmarks } from '@/providers/BookmarkProvider';
import { filterBookmarks } from '@/utils/bookmarks';

function normalizeTag(value: string | string[] | undefined): string {
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue || 'Unknown tag';
}

export default function TagScreen() {
  const params = useLocalSearchParams<{ tag?: string | string[] }>();
  const router = useRouter();
  const { bookmarks } = useBookmarks();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const tag = normalizeTag(params.tag);
  const visibleBookmarks = useMemo(
    () => filterBookmarks(bookmarks, { tag, query }),
    [bookmarks, query, tag],
  );
  const hasSearchQuery = query.trim().length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <Stack.Screen options={{ title: tag }} />
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>
          {tag}
        </Text>
        <RouteStamp>STACK PUSH</RouteStamp>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          accessibilityLabel="Search tag bookmarks"
          onChangeText={setQuery}
          placeholder="Search this tag"
          placeholderTextColor={colors.muted}
          style={[
            styles.search,
            { backgroundColor: colors.paper, borderColor: colors.line, color: colors.ink },
          ]}
          value={query}
        />
      </View>
      <View style={styles.results}>
        {visibleBookmarks.length > 0 ? (
          <BookmarkList bookmarks={visibleBookmarks} emptyMessage="No bookmarks for this tag." />
        ) : (
          <EmptyState
            actionLabel="Back to all bookmarks"
            message={
              hasSearchQuery
                ? 'Try a different search or return to all bookmarks.'
                : `There are no bookmarks saved with the ${tag} tag.`
            }
            onAction={() => router.replace('/')}
            title={hasSearchQuery ? 'No matching bookmarks' : 'Bookmark not found'}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heading: { alignItems: 'flex-start', gap: 8, paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 31 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16 },
  search: {
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  results: { flex: 1 },
});
